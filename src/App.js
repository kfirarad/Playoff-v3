import "./styles.scss";
import { useEffect, useState } from "react";
import Switch from "react-switch";
import debounce from "debounce-promise";

import {
  initialTeams,
  initialFixtures,
  currentVersion,
  resultsTypes,
  BASE_POSITION,
} from "./constans";

import {
  calcuateTeamsPointes,
  minifyJson,
  confetti,
  trackEvent,
  randomGoals,
  getDataFromClient,
  mergeFixtures,
  getShareLink,
  copyToClipboard,
} from "./utils";

import { getCalc } from "./calc";
import LeagueTable from "./components/LeagueTable";
import Fixtures from "./components/Fixtures";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const getCalcDebounce = debounce(getCalc, 750);

const toastSettings = {
  icon: "📋",
  position: "top-center",
  autoClose: 2500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export default function App() {
  const [fixtures, setFixtures] = useState([...initialFixtures]);
  const [teams, setTeams] = useState(
    calcuateTeamsPointes(initialTeams, [...initialFixtures])
  );

  const [showGoals, setShowGoals] = useState(false);
  const [currentPoolSize, setCurrentPoolSize] = useState(0);
  const [chancePrecentile, setChancePrecentile] = useState(new Map());
  useEffect(() => {
    if (fixtures.every((f) => f.result)) {
      const hptPosition =
        teams.findIndex((t) => t.key === "hpt") + 1 + BASE_POSITION;
      trackEvent({
        action: "complete",
        category: "hpt",
        label: hptPosition,
      });
      trackEvent({
        action: "complete",
        category: "complete",
        label: fixtures.reduce((a, v) => a.concat(v.result), ""),
      });
    }
  }, [teams, fixtures, chancePrecentile]);

  useEffect(() => {
    setChancePrecentile(new Map());
    getCalcDebounce(fixtures, 10000).then((result) => {
      const { precentile = new Map(), poolSize } = result;
      setChancePrecentile(precentile);
      // if (precentile.get("hpt") >= 100) {
      //   confetti({
      //     particleCount: 750,
      //     spread: 360,
      //     colors: ["#89CFF0", "#0047AB", "#3F00FF", "#4169E1"],
      //   });
      // }
      setCurrentPoolSize(poolSize);
    });
    setTeams(calcuateTeamsPointes(initialTeams, fixtures));
    if (window.currentCalcuation.size > 0) {
      window.currentCalcuation.clear();
      // setCurrentPoolSize(0);
      handleCalc();
    }
  }, [fixtures]);

  useEffect(() => {
    const clientFixtures = getDataFromClient();
    setFixtures(mergeFixtures(initialFixtures, clientFixtures));
  }, []);

  const applyFixtureResult = (
    changedFixtureIdx,
    result,
    homeGoals,
    awayGoals
  ) => {
    const newFixtures = [...fixtures];
    const idx = newFixtures.findIndex(
      (f) => `${f.home}/${f.away}` === changedFixtureIdx
    );

    if (newFixtures[idx].lock) return;

    const mutatedResult =
      result === newFixtures[idx].result ? undefined : result;
    newFixtures[idx] = {
      ...newFixtures[idx],
      result: mutatedResult,
      homeGoals: mutatedResult ? homeGoals : undefined,
      awayGoals: mutatedResult ? awayGoals : undefined,
    };
    setFixtures(newFixtures);

    const minified = minifyJson(newFixtures);
    window.localStorage.setItem("fixtures", minified);
    window.localStorage.setItem("version", currentVersion);
  };

  const shareLink = getShareLink(fixtures);

  const reset = () => {
    trackEvent({ action: "click", category: "button", label: "reset" });
    setFixtures(initialFixtures);
  };

  const copyShareLink = () => {
    trackEvent({ action: "click", category: "button", label: "share" });
    copyToClipboard(shareLink).then(() => {
      toast.success("הועתק ללוח", toastSettings);
    });
  };

  const shuffle = () => {
    trackEvent({ action: "click", category: "button", label: "shuffle" });
    const shuffleAll = fixtures.every((f) => f.result);
    const newFixtures = fixtures.map((f) => {
      if (f.lock || (f.result && !shuffleAll)) {
        return f;
      }
      const homeGoals = randomGoals();
      const awayGoals = randomGoals();
      const result =
        homeGoals > awayGoals
          ? resultsTypes.HOME
          : homeGoals < awayGoals
          ? resultsTypes.AWAY
          : resultsTypes.TIE;
      return { ...f, result, homeGoals, awayGoals };
    });
    setFixtures(newFixtures);
  };

  const toggleGoals = (checked) => {
    trackEvent({
      action: "click",
      category: "goals",
      label: checked.toString(),
    });
    setShowGoals(checked);
  };

  const handleCalc = () => {
    // if (fixtures.every((f) => f.result)) {
    //   trackEvent({
    //     category: "calcuation",
    //     action: "start",
    //     label: currentPoolSize ? "enlarging" : "start",
    //     value: currentPoolSize
    //   });
    // }
  };

  return (
    <div className="App">
      <div id="table">
        <LeagueTable
          teams={teams}
          showGoals={showGoals}
          chancePrecentile={chancePrecentile}
        />
      </div>
      <div className="buttons">
        <button onClick={copyShareLink}>שתף מצב נוכחי</button>
        <button onClick={reset}>איפוס</button>
        <button onClick={shuffle}>אקראי</button>
        {/* <div>
          <button onClick={handleCalc}>
            {currentPoolSize === 0 ? "חישוב סיכויים" : "הגדלת מדגם"}
          </button>
        </div> */}
      </div>
      {/* {currentPoolSize > 0 && <span>גודל מדגם: {currentPoolSize}</span>} */}

      <div>
        <label>
          <Switch
            onChange={toggleGoals}
            checked={showGoals}
            className="switch"
          />
          הפרש שערים
        </label>
      </div>
      <div id="fixtures">
        <Fixtures
          fixtures={fixtures}
          applyFn={applyFixtureResult}
          showGoals={showGoals}
        />
      </div>
      <ToastContainer rtl />
    </div>
  );
}
