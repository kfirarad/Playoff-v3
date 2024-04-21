import { resultsTypes, currentVersion, GAMES_PLAYED_INITIAL } from "./constans";
import confetti from "canvas-confetti";

const pointsWon = (fixtures) =>
  fixtures.reduce((ac, fixture) => {
    if (fixture.result === resultsTypes.HOME) {
      ac[fixture.home] = (ac[fixture.home] || 0) + 3;
    }
    if (fixture.result === resultsTypes.AWAY) {
      ac[fixture.away] = (ac[fixture.away] || 0) + 3;
    }
    if (fixture.result === resultsTypes.TIE) {
      ac[fixture.home] = (ac[fixture.home] || 0) + 1;
      ac[fixture.away] = (ac[fixture.away] || 0) + 1;
    }
    return ac;
  }, {});

const goalsWon = (fixtures) =>
  fixtures.reduce((ac, fixture) => {
    ac[fixture.home] =
      (ac[fixture.home] || 0) +
      (fixture.homeGoals || 0) -
      (fixture.awayGoals || 0);
    ac[fixture.away] =
      (ac[fixture.away] || 0) +
      (fixture.awayGoals || 0) -
      (fixture.homeGoals || 0);
    return ac;
  }, {});

const calcuateTeamsPointes = function (teams, fixtures = []) {
  const gamesAdded = fixtures.reduce((ac, fixture) => {
    if (fixture.result) {
      ac[fixture.home] = (ac[fixture.home] || 0) + 1;
      ac[fixture.away] = (ac[fixture.away] || 0) + 1;
    }
    return ac;
  }, {});

  const pointsAdded = pointsWon(fixtures);
  const goalsAdded = goalsWon(fixtures);
  return teams
    .map((t) => {
      return {
        ...t,
        games: (gamesAdded[t.key] || 0) + GAMES_PLAYED_INITIAL,
        points: t.initialPoints + (pointsAdded[t.key] || 0),
        goalDiffrence: t.goalDiffrence + (goalsAdded[t.key] || 0)
      };
    })
    .sort(
      (t1, t2) => t2.points - t1.points || t2.goalDiffrence - t1.goalDiffrence
    );
};

const getTeamDisplayName = (teams, teamKey) =>
  teams.find((t) => t.key === teamKey)?.displayName || teamKey;

function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function minifyJson(fixtures) {
  const minified = fixtures.map((f) => {
    return [f.home, f.round, f.result, f.homeGoals, f.awayGoals];
  });
  return JSON.stringify(minified);
}

function unminifyJson(raw = []) {
  return raw.map((f) => {
    const [home, round, result, homeGoals, awayGoals] = f;
    return {
      home,
      round,
      result,
      homeGoals,
      awayGoals
    };
  });
}

function trackEvent({ action, category, label, value }) {
  if (window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
}

const groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

const randomIntFromInterval = (min, max) => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const randomGoals = () => {
  const posibleValues = [0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3];
  const randomIndex = Math.floor(
    Math.random() * (posibleValues.length - 1 + 1)
  );
  return posibleValues[randomIndex];
};

const getDataFromClient = () => {
  try {
    const qsState = atob(new URL(document.location).searchParams.get("state"));
    const fixturesFromLS = window.localStorage.getItem("fixtures");
    if (isJsonString(qsState)) {
      return JSON.parse(qsState);
    } else if (isJsonString(fixturesFromLS)) {
      const LSVersion =
        window.localStorage.getItem("version") === currentVersion.toString();
      if (LSVersion && fixturesFromLS.length) {
        return JSON.parse(fixturesFromLS);
      }
    }
  } catch (error) {
    console.error(error);
  }
  return [];
};

const mergeFixtures = (appFixtures, clientFixtures) => {
  const unminified = unminifyJson(clientFixtures);
  const newFixtures = unminified.reduce(
    (ac, clientFixture) => {
      const initialIndex = appFixtures.findIndex(
        (fixture) =>
          fixture.home === clientFixture.home &&
          fixture.round === clientFixture.round
      );
      const { result, homeGoals, awayGoals } = clientFixture;
      if (initialIndex !== -1 && result) {
        ac[initialIndex] = {
          ...appFixtures[initialIndex],
          result,
          homeGoals,
          awayGoals
        };
      }
      return ac;
    },
    [...appFixtures]
  );
  return newFixtures;
};

const getShareLink = (fixtures) => {
  const shareLink = new URL(document.location.origin);
  shareLink.searchParams.set(
    "state",
    btoa(minifyJson(fixtures.filter((f) => f.result)))
  );
  return shareLink;
};

const copyToClipboard = (shareLink, toast) => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|Opera Mini/i.test(
    navigator.userAgent
  );

  if (isMobile && navigator.share) {
    return navigator.share({
      text: shareLink.toString()
    });
  } else if (navigator.clipboard) {
    return navigator.clipboard
      .writeText(shareLink.toString())
      .catch((e) => console.error(e));
  } else {
    window.prompt(shareLink.toString());
    return Promise.resolve();
  }
};

export {
  calcuateTeamsPointes,
  getTeamDisplayName,
  isJsonString,
  confetti,
  minifyJson,
  unminifyJson,
  trackEvent,
  groupBy,
  randomIntFromInterval,
  randomGoals,
  getDataFromClient,
  mergeFixtures,
  getShareLink,
  copyToClipboard
};
