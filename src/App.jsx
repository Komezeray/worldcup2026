import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { groups } from "./data/groups";
import { allTeams } from "./data/teams";
import { matches } from "./data/matches";

const turkeyResults = [
  "Son 32'de Elenir",
  "Gruplarda Elenir",
  "Son 16'da Elenir",
  "Çeyrek Finalde Elenir",
  "Yarı Finalde Elenir",
  "İkinci Bitirir",
  "Şampiyon Olur",
];




function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

const handleLogin = async () => {
  const cleanUsername = username.trim();
  const cleanPassword = password.trim();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", cleanUsername)
    .eq("password", cleanPassword)
    .limit(1);

  console.log("LOGIN DATA:", data);
  console.log("LOGIN ERROR:", error);

  if (error) {
    alert("Supabase hatası: " + error.message);
    return;
  }

  if (!data || data.length === 0) {
    alert("Kullanıcı adı veya şifre hatalı.");
    return;
  }

  const user = data[0];

  localStorage.setItem("loggedInUser", user.username);
  localStorage.setItem("isAdmin", user.is_admin ? "true" : "false");

  onLogin(user.username);
};

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-700 rounded-3xl p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏆</div>
          <h1 className="text-3xl font-extrabold text-white">WORLD CUP 2026</h1>
          <p className="text-slate-400 mt-2">Tahmin Sistemine Giriş Yap</p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Kullanıcı Adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 text-white outline-none"
          />

          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 text-white outline-none"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-emerald-600 py-4 rounded-2xl font-bold text-lg active:scale-95 transition"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    </div>
  );
}

function Layout({ loggedInUser, onLogout, onChangePassword }) {
  const isAdmin = loggedInUser === "KomezEray";

  const menus = [
    { name: "Sıralama", path: "/" },
    { name: "Maç Bülteni", path: "/mac-bulteni" },
    { name: "Maç Tahminlerim", path: "/mac-tahminlerim" },
    { name: "Katılımcı Tahminleri", path: "/katilimci-tahminleri" },
    { name: "Grup Liderleri", path: "/grup-liderleri" },
    { name: "Şampiyon", path: "/sampiyon" },
    { name: "Türkiye", path: "/turkiye" },
    ...(isAdmin ? [{ name: "Admin Paneli", path: "/admin" }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <header className="bg-[#0f172a] border-b border-slate-700 px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide">
              WORLD CUP <span className="text-emerald-400">2026</span>
            </h1>
          </div>

          <div className="text-right">
            <div className="text-sm text-slate-400">Kullanıcı</div>
            <div className="font-bold mb-2">{loggedInUser}</div>

            <button
              onClick={onChangePassword}
              className="block w-full text-xs text-emerald-400 underline mb-1"
            >
              Şifre Değiştir
            </button>

            <button
              onClick={onLogout}
              className="block w-full text-xs text-red-400 underline"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <nav className="flex gap-3 overflow-x-auto pb-5 border-b border-slate-700">
          {menus.map((menu) => (
            <NavLink
              key={menu.path}
              to={menu.path}
              className={({ isActive }) =>
                `min-w-fit rounded-2xl px-7 py-4 font-bold transition active:scale-95 ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "bg-[#0f172a] text-slate-300 border border-slate-700"
                }`
              }
            >
              {menu.name}
            </NavLink>
          ))}
        </nav>

        <section className="mt-6">
          <Routes>
            <Route path="/" element={<Siralama />} />
            <Route path="/mac-bulteni" element={<MacBulteni />} />
            <Route path="/mac-tahminlerim" element={<MacTahminlerim />} />
            <Route
              path="/katilimci-tahminleri"
              element={<KatilimciTahminleri />}
            />
            <Route path="/grup-liderleri" element={<GrupLiderleri />} />
            <Route path="/sampiyon" element={<Sampiyon />} />
            <Route path="/turkiye" element={<Turkiye />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}
function getMatchResult(score) {
  const home = Number(score?.home);
  const away = Number(score?.away);

  if (Number.isNaN(home) || Number.isNaN(away)) return null;

  if (home > away) return 1;
  if (home === away) return 0;
  return 2;
}

function getOverUnderResult(score) {
  const home = Number(score?.home);
  const away = Number(score?.away);

  if (Number.isNaN(home) || Number.isNaN(away)) return null;

  const totalGoals = home + away;

  return totalGoals >= 3 ? "Üst" : "Alt";
}

function calculateStandings() {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const predictions = JSON.parse(localStorage.getItem("predictions")) || [];
  const matchOdds = JSON.parse(localStorage.getItem("matchOdds")) || {};
  const matchScores = JSON.parse(localStorage.getItem("matchScores")) || {};
  const customMatches = JSON.parse(localStorage.getItem("customMatches")) || [];

  const groupOdds = JSON.parse(localStorage.getItem("groupOdds")) || {};
  const realGroupWinners =
    JSON.parse(localStorage.getItem("realGroupWinners")) || {};

  const championOdds = JSON.parse(localStorage.getItem("championOdds")) || {};
  const realChampion = localStorage.getItem("realChampion") || "";

  const allMatches = [...matches, ...customMatches];

  return users
    .map((user) => {
      let points = 0;
      let correct = 0;
      let total = 0;

      allMatches.forEach((match) => {
        const score = matchScores[match.id];

        if (!score?.home && score?.home !== "0") return;
        if (!score?.away && score?.away !== "0") return;

        const realMS = getMatchResult(score);
        const realOU = getOverUnderResult(score);

        const userPrediction = predictions.find(
          (p) => p.user === user.username && p.matchId === match.id
        );

        const odds = matchOdds[match.id] || match.odds;

        total += 2;

        if (!userPrediction) return;

        if (userPrediction.ms === realMS) {
          correct += 1;

          if (realMS === 1) points += Number(odds.ms1 || 0);
          if (realMS === 0) points += Number(odds.ms0 || 0);
          if (realMS === 2) points += Number(odds.ms2 || 0);
        }

        if (userPrediction.ou === realOU) {
          correct += 1;

          if (realOU === "Alt") points += Number(odds.under || 0);
          if (realOU === "Üst") points += Number(odds.over || 0);
        }
      });

      const userGroupPredictions =
        JSON.parse(localStorage.getItem(`groupPredictions_${user.username}`)) ||
        {};

      Object.entries(realGroupWinners).forEach(([groupName, realWinner]) => {
        if (!realWinner) return;

        total += 1;

        const userPick = userGroupPredictions[groupName];

        if (userPick === realWinner) {
          correct += 1;
          points += Number(groupOdds[`${groupName}-${realWinner}`] || 0);
        }
      });

      if (realChampion) {
        total += 1;

        const userChampion =
          localStorage.getItem(`championPrediction_${user.username}`) || "";

        if (userChampion === realChampion) {
          correct += 1;
          points += Number(championOdds[realChampion] || 0);
        }
      }

      return {
        name: user.username,
        points: Number(points.toFixed(2)),
        success: total === 0 ? 0 : Number(((correct / total) * 100).toFixed(2)),
        correct: `${correct}/${total}`,
      };
    })
    .sort((a, b) => b.points - a.points);
}

function Siralama() {
  const [tableUsers, setTableUsers] = useState([]);

  useEffect(() => {
    calculateStandingsFromSupabase();
  }, []);

  const getMSResult = (home, away) => {
    if (home > away) return 1;
    if (home === away) return 0;
    return 2;
  };

  const getOUResult = (home, away) => {
    return home + away >= 3 ? "Üst" : "Alt";
  };

  const calculateStandingsFromSupabase = async () => {
    const { data: users } = await supabase.from("users").select("*");
    const { data: predictions } = await supabase.from("predictions").select("*");
    const { data: odds } = await supabase.from("match_odds").select("*");
    const { data: scores } = await supabase.from("match_scores").select("*");

    const { data: groupPredictions } = await supabase
      .from("group_predictions")
      .select("*");

    const { data: groupOdds } = await supabase.from("group_odds").select("*");

    const { data: realGroupWinners } = await supabase
      .from("real_group_winners")
      .select("*");

    const { data: championPredictions } = await supabase
      .from("champion_predictions")
      .select("*");

    const { data: championOdds } = await supabase
      .from("champion_odds")
      .select("*");

    const { data: realChampionData } = await supabase
      .from("real_champion")
      .select("*")
      .limit(1);

    const { data: turkeyPredictions } = await supabase
      .from("turkey_predictions")
      .select("*");

    const { data: turkeyOdds } = await supabase
      .from("turkey_odds")
      .select("*");

    const { data: realTurkeyData } = await supabase
      .from("real_turkey_result")
      .select("*")
      .limit(1);

    const realChampion = realChampionData?.[0]?.champion || "";
    const realTurkeyResult = realTurkeyData?.[0]?.result_name || "";

    const standings = (users || []).map((user) => {
      let matchPoints = 0;
      let groupPoints = 0;
      let championPoints = 0;
      let turkeyPoints = 0;

      let correct = 0;
      let total = 0;

      // MAÇ PUANLARI
      (scores || []).forEach((score) => {
        const matchId = Number(score.match_id);
        const homeScore = Number(score.home_score);
        const awayScore = Number(score.away_score);

        const userPrediction = (predictions || []).find(
          (p) =>
            p.user_name === user.username &&
            Number(p.match_id) === matchId
        );

        const matchOdd = (odds || []).find(
          (o) => Number(o.match_id) === matchId
        );

        if (!matchOdd) return;

        const realMS = getMSResult(homeScore, awayScore);
        const realOU = getOUResult(homeScore, awayScore);

        total += 2;

        if (!userPrediction) return;

        if (Number(userPrediction.ms) === realMS) {
          correct += 1;

          if (realMS === 1) matchPoints += Number(matchOdd.ms1 || 0);
          if (realMS === 0) matchPoints += Number(matchOdd.ms0 || 0);
          if (realMS === 2) matchPoints += Number(matchOdd.ms2 || 0);
        }

        if (userPrediction.ou === realOU) {
          correct += 1;

          if (realOU === "Alt") matchPoints += Number(matchOdd.under || 0);
          if (realOU === "Üst") matchPoints += Number(matchOdd.over || 0);
        }
      });

      // GRUP BİRİNCİLİĞİ PUANLARI
      (realGroupWinners || []).forEach((realGroup) => {
        if (!realGroup.winner) return;

        total += 1;

        const userGroupPrediction = (groupPredictions || []).find(
          (p) =>
            p.user_name === user.username &&
            p.group_name === realGroup.group_name
        );

        if (!userGroupPrediction) return;

        if (userGroupPrediction.team_name === realGroup.winner) {
          correct += 1;

          const oddRow = (groupOdds || []).find(
            (o) =>
              o.group_name === realGroup.group_name &&
              o.team_name === realGroup.winner
          );

          groupPoints += Number(oddRow?.odd || 0);
        }
      });

      // ŞAMPİYONLUK PUANI
      if (realChampion) {
        total += 1;

        const userChampionPrediction = (championPredictions || []).find(
          (p) => p.user_name === user.username
        );

        if (userChampionPrediction?.team_name === realChampion) {
          correct += 1;

          const oddRow = (championOdds || []).find(
            (o) => o.team_name === realChampion
          );

          championPoints += Number(oddRow?.odd || 0);
        }
      }

      // TÜRKİYE PUANI
      if (realTurkeyResult) {
        total += 1;

        const userTurkeyPrediction = (turkeyPredictions || []).find(
          (p) => p.user_name === user.username
        );

        if (userTurkeyPrediction?.result_name === realTurkeyResult) {
          correct += 1;

          const oddRow = (turkeyOdds || []).find(
            (o) => o.result_name === realTurkeyResult
          );

          turkeyPoints += Number(oddRow?.odd || 0);
        }
      }

      const totalPoints =
        matchPoints + groupPoints + championPoints + turkeyPoints;

      return {
        name: user.username,
        matchPoints: Number(matchPoints.toFixed(2)),
        groupPoints: Number(groupPoints.toFixed(2)),
        championPoints: Number(championPoints.toFixed(2)),
        turkeyPoints: Number(turkeyPoints.toFixed(2)),
        totalPoints: Number(totalPoints.toFixed(2)),
        success: total === 0 ? 0 : Number(((correct / total) * 100).toFixed(2)),
        correctText:
  total === 0
    ? "0/0"
    : `${correct}/${total}`,
      };
    });

    const sorted = standings
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((user, index) => ({
        rank: index + 1,
        ...user,
      }));

    setTableUsers(sorted);
  };

  return (
    <div className="rounded-2xl bg-[#0f172a] border border-slate-700 p-4 overflow-x-auto">
      <h2 className="text-xl font-bold mb-5">Sıralama</h2>

      <table className="w-full min-w-[760px] text-sm sm:text-base">
        <thead>
          <tr className="text-slate-400 border-b border-slate-700">
            <th className="text-left py-3">Sıra</th>
            <th className="text-left py-3">Kullanıcı</th>
            <th className="text-left py-3">Toplam</th>
            <th className="text-left py-3">Başarı %</th>
            <th className="text-left py-3">Doğru Tahmin</th>
            <th className="text-left py-3">Maç</th>
            <th className="text-left py-3">Grup</th>
            <th className="text-left py-3">Şampiyon</th>
            <th className="text-left py-3">Türkiye</th>
          </tr>
        </thead>

        <tbody>
  {tableUsers.map((user) => (
    <tr key={user.name} className="border-b border-slate-800">
      <td className="py-4 px-2">{user.rank}</td>
      <td className="py-4 px-2 font-semibold">{user.name}</td>

      <td className="py-4 px-2 text-emerald-400 font-extrabold">
        {user.totalPoints}
      </td>

      <td className="py-4 px-2">%{user.success}</td>
      <td className="py-4 px-2">{user.correctText}</td>

      <td className="py-4 px-2 text-slate-300 font-bold">
        {user.matchPoints}
      </td>

      <td className="py-4 px-2 text-slate-300 font-bold">
        {user.groupPoints}
      </td>

      <td className="py-4 px-2 text-slate-300 font-bold">
        {user.championPoints}
      </td>

      <td className="py-4 px-2 text-slate-300 font-bold">
        {user.turkeyPoints}
      </td>
    </tr>
  ))}
</tbody>
      </table>
    </div>
  );
}

function MacBulteni() {
  const [predictions, setPredictions] = useState({});
  const [filter, setFilter] = useState("all");
  const [now, setNow] = useState(new Date());
  const [dbOdds, setDbOdds] = useState([]);

  const customMatches = JSON.parse(localStorage.getItem("customMatches")) || [];

  const allMatches = [...matches, ...customMatches];

  React.useEffect(() => {
    fetchDbOdds();
  }, []);

  const fetchDbOdds = async () => {
    const { data, error } = await supabase
      .from("match_odds")
      .select("*");

    if (error) {
      console.log("Oranlar alınamadı:", error);
      return;
    }

    setDbOdds(data || []);
  };

  const getMatchOdds = (matchId) => {
    return dbOdds.find(
      (odd) => Number(odd.match_id) === Number(matchId)
    );
  };

  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getMatchDateTime = (match) => {
    return new Date(`${match.dateOrder}T${match.time}:00`);
  };

  const getPredictionDeadline = (match) => {
    const matchDate = getMatchDateTime(match);
    return new Date(matchDate.getTime() - 15 * 60 * 1000);
  };

  const isPredictionClosed = (match) => {
    return now >= getPredictionDeadline(match);
  };

  const formatDeadline = (match) => {
    const deadline = getPredictionDeadline(match);

    return deadline.toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRemainingTimeText = (match) => {
    const deadline = getPredictionDeadline(match);
    const diffMs = deadline - now;

    if (diffMs <= 0) {
      return "Tahmin süresi kapandı";
    }

    const totalMinutes = Math.floor(diffMs / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) {
      return `${days} gün ${hours} saat ${minutes} dk kaldı`;
    }

    if (hours > 0) {
      return `${hours} saat ${minutes} dk kaldı`;
    }

    return `${minutes} dk kaldı`;
  };

  const sortedMatches = [...allMatches].sort((a, b) => {
    const dateCompare = a.dateOrder.localeCompare(b.dateOrder);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

  const filteredMatches =
    filter === "all"
      ? sortedMatches
      : typeof filter === "number"
      ? sortedMatches.filter((match) => match.matchday === filter)
      : sortedMatches.filter((match) => match.stage === filter);

  const selectMS = (matchId, value, match) => {
    if (isPredictionClosed(match)) return;

    setPredictions((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], ms: value },
    }));
  };

  const selectOU = (matchId, value, match) => {
    if (isPredictionClosed(match)) return;

    setPredictions((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], ou: value },
    }));
  };

  const savePrediction = async (match) => {
  if (isPredictionClosed(match)) {
    alert("Bu maç için tahmin süresi kapandı.");
    return;
  }

  const prediction = predictions[match.id];

  if (!prediction?.ms && prediction?.ms !== 0) {
    alert("Lütfen maç sonucu tahmini seç.");
    return;
  }

  if (!prediction?.ou) {
    alert("Lütfen Alt / Üst tahmini seç.");
    return;
  }

  const loggedInUser = localStorage.getItem("loggedInUser");

  await supabase
    .from("predictions")
    .delete()
    .eq("user_name", loggedInUser)
    .eq("match_id", match.id);

  const { error } = await supabase.from("predictions").insert({
    user_name: loggedInUser,
    match_id: match.id,
    ms: prediction.ms,
    ou: prediction.ou,
  });

  if (error) {
    alert("Tahmin kaydedilemedi.");
    console.log(error);
    return;
  }

  alert("Tahmin kaydedildi.");
};

  const filters = [
    { label: "Tümü", value: "all" },
    { label: "1. Maçlar", value: 1 },
    { label: "2. Maçlar", value: 2 },
    { label: "3. Maçlar", value: 3 },
    { label: "Son 32", value: "Son 32" },
    { label: "Son 16", value: "Son 16" },
    { label: "Çeyrek Final", value: "Çeyrek Final" },
    { label: "Yarı Final", value: "Yarı Final" },
    { label: "Üçüncülük", value: "Üçüncülük" },
    { label: "Final", value: "Final" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Maç Bülteni</h2>
        <div className="text-sm text-slate-400">{filteredMatches.length} maç</div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((item) => (
          <button
            key={item.label}
            onClick={() => setFilter(item.value)}
            className={`min-w-fit rounded-xl px-4 py-2 font-bold ${
              filter === item.value
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-300 border border-slate-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filteredMatches.map((match) => {
        const selectedMS = predictions[match.id]?.ms;
        const selectedOU = predictions[match.id]?.ou;
        const odds = getMatchOdds(match.id) || {};
        const closed = isPredictionClosed(match);

        return (
          <div
            key={match.id}
            className={`rounded-2xl border p-5 ${
              closed
                ? "bg-slate-900 border-red-500/40 opacity-80"
                : "bg-[#0f172a] border-slate-700"
            }`}
          >
            <div className="text-sm text-slate-400 mb-2">
              {match.stage === "Grup"
                ? `Grup ${match.group} • ${match.matchday}. Maç`
                : match.stage}{" "}
              • {match.date} - {match.time}
            </div>

            <div className="text-lg font-bold mb-3">
              {match.home} - {match.away}
            </div>

            <div
              className={`mb-4 rounded-xl px-4 py-3 text-sm font-bold ${
                closed
                  ? "bg-red-500/10 text-red-400 border border-red-500/30"
                  : "bg-slate-800 text-slate-300 border border-slate-700"
              }`}
            >
              ⏳ Son tahmin: {formatDeadline(match)}
              <div className="mt-1 text-xs">
                {getRemainingTimeText(match)}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {[1, 0, 2].map((value) => {
                const oddValue =
                  value === 1 ? odds.ms1 : value === 0 ? odds.ms0 : odds.ms2;

                return (
                  <button
                    key={value}
                    disabled={closed}
                    onClick={() => selectMS(match.id, value, match)}
                    className={`rounded-xl p-3 ${
                      selectedMS === value
                        ? "bg-emerald-600"
                        : closed
                        ? "bg-slate-800 opacity-50 cursor-not-allowed"
                        : "bg-slate-800"
                    }`}
                  >
                    MS{value === 0 ? "X" : value}
                    <br />
                    <span className="text-white font-bold">
                      {oddValue || "-"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                disabled={closed}
                onClick={() => selectOU(match.id, "Alt", match)}
                className={`rounded-xl p-3 ${
                  selectedOU === "Alt"
                    ? "bg-emerald-600"
                    : closed
                    ? "bg-slate-800 opacity-50 cursor-not-allowed"
                    : "bg-slate-800"
                }`}
              >
                Alt <br />
                <span className="text-white font-bold">{odds.under || "-"}</span>
              </button>

              <button
                disabled={closed}
                onClick={() => selectOU(match.id, "Üst", match)}
                className={`rounded-xl p-3 ${
                  selectedOU === "Üst"
                    ? "bg-emerald-600"
                    : closed
                    ? "bg-slate-800 opacity-50 cursor-not-allowed"
                    : "bg-slate-800"
                }`}
              >
                Üst <br />
                <span className="text-white font-bold">{odds.over || "-"}</span>
              </button>
            </div>

            <button
              disabled={closed}
              onClick={() => savePrediction(match)}
              className={`w-full rounded-xl py-3 font-bold active:scale-95 transition ${
                closed
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-600"
              }`}
            >
              {closed ? "Tahmin Süresi Kapandı" : "Tahmini Kaydet"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function MacTahminlerim() {
  const loggedInUser = localStorage.getItem("loggedInUser");

  const [tab, setTab] = useState("matches");
  const [stageFilter, setStageFilter] = useState("A");
  const [matchdayFilter, setMatchdayFilter] = useState(1);

  const [myPredictions, setMyPredictions] = useState([]);
  const [dbOdds, setDbOdds] = useState([]);

  const [myGroupPredictions, setMyGroupPredictions] = useState([]);
  const [groupOdds, setGroupOdds] = useState([]);

  const [myChampion, setMyChampion] = useState(null);
  const [championOdds, setChampionOdds] = useState([]);

  const [myTurkeyPrediction, setMyTurkeyPrediction] = useState(null);
  const [turkeyOdds, setTurkeyOdds] = useState([]);

  const customMatches = JSON.parse(localStorage.getItem("customMatches")) || [];
  const allMatches = [...matches, ...customMatches];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: predictionData } = await supabase
      .from("predictions")
      .select("*")
      .eq("user_name", loggedInUser)
      .order("id", { ascending: false });

    const { data: oddsData } = await supabase.from("match_odds").select("*");

    const { data: groupPredictionData } = await supabase
      .from("group_predictions")
      .select("*")
      .eq("user_name", loggedInUser);

    const { data: groupOddsData } = await supabase
      .from("group_odds")
      .select("*");

    const { data: championPredictionData } = await supabase
      .from("champion_predictions")
      .select("*")
      .eq("user_name", loggedInUser)
      .limit(1);

    const { data: championOddsData } = await supabase
      .from("champion_odds")
      .select("*");

    const { data: turkeyPredictionData } = await supabase
      .from("turkey_predictions")
      .select("*")
      .eq("user_name", loggedInUser)
      .limit(1);

    const { data: turkeyOddsData } = await supabase
      .from("turkey_odds")
      .select("*");

    setMyPredictions(predictionData || []);
    setDbOdds(oddsData || []);
    setMyGroupPredictions(groupPredictionData || []);
    setGroupOdds(groupOddsData || []);
    setMyChampion(championPredictionData?.[0] || null);
    setChampionOdds(championOddsData || []);
    setMyTurkeyPrediction(turkeyPredictionData?.[0] || null);
    setTurkeyOdds(turkeyOddsData || []);
  };

  const getPrediction = (matchId) => {
    return myPredictions.find(
      (p) => Number(p.match_id) === Number(matchId)
    );
  };

  const getMatchOdds = (matchId) => {
    return dbOdds.find((odd) => Number(odd.match_id) === Number(matchId));
  };

  const getSelectedMsOdd = (prediction, odds) => {
    if (!prediction || !odds) return "-";
    if (Number(prediction.ms) === 1) return odds.ms1 || "-";
    if (Number(prediction.ms) === 0) return odds.ms0 || "-";
    if (Number(prediction.ms) === 2) return odds.ms2 || "-";
    return "-";
  };

  const getSelectedOuOdd = (prediction, odds) => {
    if (!prediction || !odds) return "-";
    if (prediction.ou === "Alt") return odds.under || "-";
    if (prediction.ou === "Üst") return odds.over || "-";
    return "-";
  };

  const getGroupPrediction = (groupName) => {
    return myGroupPredictions.find((p) => p.group_name === groupName);
  };

  const getGroupOdd = (groupName, teamName) => {
    const odd = groupOdds.find(
      (o) => o.group_name === groupName && o.team_name === teamName
    );

    return odd?.odd || "-";
  };

  const getChampionOdd = (teamName) => {
    const odd = championOdds.find((o) => o.team_name === teamName);
    return odd?.odd || "-";
  };

  const getTurkeyOdd = (resultName) => {
    const odd = turkeyOdds.find((o) => o.result_name === resultName);
    return odd?.odd || "-";
  };

  const tabs = [
    { label: "Maçlar", value: "matches" },
    { label: "Grup Liderleri", value: "groupleaders" },
    { label: "Şampiyon", value: "champion" },
    { label: "Türkiye", value: "turkiye" },
  ];

  const groupStageFilters = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
  ];

  const knockoutFilters = [
    "Son 32",
    "Son 16",
    "Çeyrek Final",
    "Yarı Final",
    "Üçüncülük",
    "Final",
  ];

  const matchdayFilters = [
    { label: "1. Maçlar", value: 1 },
    { label: "2. Maçlar", value: 2 },
    { label: "3. Maçlar", value: 3 },
  ];

  const activeClass = "bg-emerald-600 text-white";
  const passiveClass = "bg-slate-800 text-slate-300 border border-slate-700";

  const filteredMatches = allMatches
    .filter((match) => {
      if (groupStageFilters.includes(stageFilter)) {
        return (
          match.stage === "Grup" &&
          match.group === stageFilter &&
          Number(match.matchday) === Number(matchdayFilter)
        );
      }

      return match.stage === stageFilter;
    })
    .sort((a, b) => {
      const da = `${a.dateOrder || a.date_order} ${a.time}`;
      const db = `${b.dateOrder || b.date_order} ${b.time}`;
      return da.localeCompare(db);
    });

  const chunkSize = groupStageFilters.includes(stageFilter) ? 2 : 1;
  const matchChunks = [];

  for (let i = 0; i < filteredMatches.length; i += chunkSize) {
    matchChunks.push(filteredMatches.slice(i, i + chunkSize));
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">Maç Tahminlerim</h2>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((item) => (
          <button
            key={item.value}
            onClick={() => setTab(item.value)}
            className={`min-w-fit rounded-xl px-4 py-2 font-bold transition ${
              tab === item.value ? activeClass : passiveClass
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "matches" && (
        <>
          <div className="rounded-2xl bg-[#0f172a] border border-slate-700 p-4 space-y-4">
            <div>
              <div className="text-slate-400 font-bold mb-3">
                🔽 GRUP / TUR SEÇİMİ:
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {groupStageFilters.map((groupName) => (
                  <button
                    key={groupName}
                    onClick={() => setStageFilter(groupName)}
                    className={`min-w-fit rounded-xl px-4 py-2 font-bold ${
                      stageFilter === groupName ? activeClass : passiveClass
                    }`}
                  >
                    Grup {groupName}
                  </button>
                ))}

                {knockoutFilters.map((stage) => (
                  <button
                    key={stage}
                    onClick={() => setStageFilter(stage)}
                    className={`min-w-fit rounded-xl px-4 py-2 font-bold ${
                      stageFilter === stage ? activeClass : passiveClass
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>

            {groupStageFilters.includes(stageFilter) && (
              <div>
                <div className="text-slate-400 font-bold mb-3">
                  🗓️ HAFTA / MAÇ AŞAMASI:
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {matchdayFilters.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setMatchdayFilter(item.value)}
                      className={`min-w-fit rounded-xl px-4 py-2 font-bold ${
                        matchdayFilter === item.value
                          ? activeClass
                          : passiveClass
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {matchChunks.length === 0 ? (
            <div className="rounded-2xl bg-[#0f172a] border border-slate-700 p-5 text-slate-400">
              Bu filtrede maç bulunamadı.
            </div>
          ) : (
            matchChunks.map((chunk, index) => (
              <div
                key={index}
                className="overflow-x-auto rounded-2xl border border-slate-700"
              >
                <table className="w-full min-w-[900px] bg-[#0f172a]">
                  <thead>
                    <tr className="border-b border-slate-700">
                      {chunk.map((match) => (
                        <th
                          key={match.id}
                          colSpan="2"
                          className="p-4 text-center font-bold"
                        >
                          {match.home} - {match.away}
                        </th>
                      ))}
                    </tr>

                    <tr className="border-b border-slate-700">
                      {chunk.map((match) => (
                        <React.Fragment key={match.id}>
                          <th className="p-3 text-emerald-400">MS</th>
                          <th className="p-3 text-yellow-400">A/Ü</th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="border-b border-slate-800">
                      {chunk.map((match) => {
                        const prediction = getPrediction(match.id);
                        const odds = getMatchOdds(match.id);

                        const msText = prediction
                          ? Number(prediction.ms) === 0
                            ? "X"
                            : prediction.ms
                          : "-";

                        const msOdd = getSelectedMsOdd(prediction, odds);
                        const ouOdd = getSelectedOuOdd(prediction, odds);

                        return (
                          <React.Fragment key={match.id}>
                            <td className="p-4 text-center text-emerald-400 font-bold">
                              {prediction ? `${msText} (${msOdd})` : "-"}
                            </td>

                            <td className="p-4 text-center text-yellow-400 font-bold">
                              {prediction
                                ? `${prediction.ou} (${ouOdd})`
                                : "-"}
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            ))
          )}
        </>
      )}

      {tab === "groupleaders" && (
        <div className="overflow-x-auto rounded-2xl border border-slate-700">
          <table className="w-full table-fixed bg-[#0f172a]">
<thead>
  <tr className="border-b border-slate-700">
    <th className="w-[26%] p-3 text-left text-slate-300">Grup</th>
    <th className="w-[48%] p-3 text-left text-slate-300">Tahminim</th>
    <th className="w-[26%] p-3 text-left text-slate-300">Oran</th>
  </tr>
</thead>

            <tbody>
              {groupStageFilters.map((groupName) => {
                const prediction = getGroupPrediction(groupName);
                const team = prediction?.team_name;
                const odd = team ? getGroupOdd(groupName, team) : "-";

                return (
                  <tr key={groupName} className="border-b border-slate-800">
<td className="p-3 font-bold whitespace-nowrap">
  Grup {groupName}
</td>

<td className="p-3 text-emerald-400 font-bold whitespace-nowrap">
  {team || "-"}
</td>

<td className="p-3 text-slate-300 font-bold whitespace-nowrap">
  {odd}
</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "champion" && (
        <div className="rounded-2xl bg-[#0f172a] border border-slate-700 p-5">
          <h3 className="text-xl font-bold mb-4">Şampiyon Tahminim</h3>

          {myChampion?.team_name ? (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-800 border border-slate-700 p-4">
              <span className="font-bold">{myChampion.team_name}</span>
              <span className="text-emerald-400 font-extrabold">
                {getChampionOdd(myChampion.team_name)}
              </span>
            </div>
          ) : (
            <div className="text-slate-400">Şampiyon tahmini bulunamadı.</div>
          )}
        </div>
      )}

      {tab === "turkiye" && (
        <div className="rounded-2xl bg-[#0f172a] border border-slate-700 p-5">
          <h3 className="text-xl font-bold mb-4">Türkiye Tahminim</h3>

          {myTurkeyPrediction?.result_name ? (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-800 border border-slate-700 p-4">
              <span className="font-bold">
                {myTurkeyPrediction.result_name}
              </span>
              <span className="text-emerald-400 font-extrabold">
                {getTurkeyOdd(myTurkeyPrediction.result_name)}
              </span>
            </div>
          ) : (
            <div className="text-slate-400">Türkiye tahmini bulunamadı.</div>
          )}
        </div>
      )}
    </div>
  );
}

function KatilimciTahminleri() {
  const [tab, setTab] = useState("matches");
  const [stageFilter, setStageFilter] = useState("A");
  const [matchdayFilter, setMatchdayFilter] = useState(1);

  const [allPredictions, setAllPredictions] = useState([]);
  const [users, setUsers] = useState([]);
  const [dbOdds, setDbOdds] = useState([]);
  const [dbScores, setDbScores] = useState([]);

  const [groupPredictions, setGroupPredictions] = useState([]);
  const [championPredictions, setChampionPredictions] = useState([]);
  const [turkeyPredictions, setTurkeyPredictions] = useState([]);

  const [groupOdds, setGroupOdds] = useState([]);
  const [championOdds, setChampionOdds] = useState([]);
  const [turkeyOdds, setTurkeyOdds] = useState([]);

  const customMatches = JSON.parse(localStorage.getItem("customMatches")) || [];
  const allMatches = [...matches, ...customMatches];

  const longTermRevealTime = new Date("2026-06-11T19:15:00");
  const showLongTermPredictions = new Date() >= longTermRevealTime;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: predictionData } = await supabase.from("predictions").select("*");
    const { data: userData } = await supabase.from("users").select("*");
    const { data: oddsData } = await supabase.from("match_odds").select("*");
    const { data: scoreData } = await supabase.from("match_scores").select("*");

    const { data: groupPredictionData } = await supabase
      .from("group_predictions")
      .select("*");

    const { data: championPredictionData } = await supabase
      .from("champion_predictions")
      .select("*");

    const { data: turkeyPredictionData } = await supabase
      .from("turkey_predictions")
      .select("*");

    const { data: groupOddsData } = await supabase.from("group_odds").select("*");
    const { data: championOddsData } = await supabase.from("champion_odds").select("*");
    const { data: turkeyOddsData } = await supabase.from("turkey_odds").select("*");

    setAllPredictions(predictionData || []);
    setUsers(userData || []);
    setDbOdds(oddsData || []);
    setDbScores(scoreData || []);
    setGroupPredictions(groupPredictionData || []);
    setChampionPredictions(championPredictionData || []);
    setTurkeyPredictions(turkeyPredictionData || []);
    setGroupOdds(groupOddsData || []);
    setChampionOdds(championOddsData || []);
    setTurkeyOdds(turkeyOddsData || []);
  };

  const isMatchPredictionVisible = (match) => {
    const matchDate = new Date(
      `${match.dateOrder || match.date_order}T${match.time}:00`
    );
    const deadline = new Date(matchDate.getTime() - 15 * 60 * 1000);
    return new Date() >= deadline;
  };

  const getPrediction = (username, matchId) => {
    return allPredictions.find(
      (p) => p.user_name === username && Number(p.match_id) === Number(matchId)
    );
  };

  const getMatchOdds = (matchId) => {
    return dbOdds.find((odd) => Number(odd.match_id) === Number(matchId));
  };

  const getMatchScore = (matchId) => {
    return dbScores.find((score) => Number(score.match_id) === Number(matchId));
  };

  const getRealMS = (score) => {
    if (!score) return null;

    const home = Number(score.home_score);
    const away = Number(score.away_score);

    if (home > away) return 1;
    if (home === away) return 0;
    return 2;
  };

  const getRealOU = (score) => {
    if (!score) return null;

    const total = Number(score.home_score) + Number(score.away_score);
    return total >= 3 ? "Üst" : "Alt";
  };

  const getMsOdd = (prediction, odds) => {
    if (!prediction || !odds) return "-";

    if (Number(prediction.ms) === 1) return odds.ms1 || "-";
    if (Number(prediction.ms) === 0) return odds.ms0 || "-";
    if (Number(prediction.ms) === 2) return odds.ms2 || "-";

    return "-";
  };

  const getOuOdd = (prediction, odds) => {
    if (!prediction || !odds) return "-";

    if (prediction.ou === "Alt") return odds.under || "-";
    if (prediction.ou === "Üst") return odds.over || "-";

    return "-";
  };

  const getMsClass = (prediction, score) => {
    if (!prediction || !score) return "text-emerald-400";

    return Number(prediction.ms) === getRealMS(score)
      ? "text-emerald-400"
      : "text-red-400";
  };

  const getOuClass = (prediction, score) => {
    if (!prediction || !score) return "text-yellow-400";

    return prediction.ou === getRealOU(score)
      ? "text-emerald-400"
      : "text-red-400";
  };

  const getGroupPrediction = (username, groupName) => {
    return groupPredictions.find(
      (p) => p.user_name === username && p.group_name === groupName
    );
  };

  const getGroupOdd = (groupName, teamName) => {
    const odd = groupOdds.find(
      (o) => o.group_name === groupName && o.team_name === teamName
    );

    return odd?.odd || "-";
  };

  const getChampionPrediction = (username) => {
    return championPredictions.find((p) => p.user_name === username);
  };

  const getChampionOdd = (teamName) => {
    const odd = championOdds.find((o) => o.team_name === teamName);
    return odd?.odd || "-";
  };

  const getTurkeyPrediction = (username) => {
    return turkeyPredictions.find((p) => p.user_name === username);
  };

  const getTurkeyOdd = (resultName) => {
    const odd = turkeyOdds.find((o) => o.result_name === resultName);
    return odd?.odd || "-";
  };

  const mainTabs = [
    { label: "Maçlar", value: "matches" },
    { label: "Grup Liderleri", value: "groupleaders" },
    { label: "Şampiyon", value: "champion" },
    { label: "Türkiye", value: "turkiye" },
  ];

  const groupStageFilters = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
  ];

  const knockoutFilters = [
    "Son 32",
    "Son 16",
    "Çeyrek Final",
    "Yarı Final",
    "Üçüncülük",
    "Final",
  ];

  const matchdayFilters = [
    { label: "1. Maçlar", value: 1 },
    { label: "2. Maçlar", value: 2 },
    { label: "3. Maçlar", value: 3 },
  ];

  const activeClass = "bg-emerald-600 text-white";
  const passiveClass = "bg-slate-800 text-slate-300 border border-slate-700";

  const filteredMatches = allMatches
    .filter((match) => {
      if (groupStageFilters.includes(stageFilter)) {
        return (
          match.stage === "Grup" &&
          match.group === stageFilter &&
          Number(match.matchday) === Number(matchdayFilter)
        );
      }

      return match.stage === stageFilter;
    })
    .filter(isMatchPredictionVisible)
    .sort((a, b) => {
      const da = `${a.dateOrder || a.date_order} ${a.time}`;
      const db = `${b.dateOrder || b.date_order} ${b.time}`;
      return da.localeCompare(db);
    });

  const chunkSize = groupStageFilters.includes(stageFilter) ? 2 : 1;
  const matchChunks = [];

  for (let i = 0; i < filteredMatches.length; i += chunkSize) {
    matchChunks.push(filteredMatches.slice(i, i + chunkSize));
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">Katılımcı Tahminleri</h2>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {mainTabs.map((item) => (
          <button
            key={item.value}
            onClick={() => setTab(item.value)}
            className={`min-w-fit rounded-xl px-4 py-2 font-bold ${
              tab === item.value ? activeClass : passiveClass
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "matches" && (
        <>
          <div className="rounded-2xl bg-[#0f172a] border border-slate-700 p-4 space-y-4">
            <div>
              <div className="text-slate-400 font-bold mb-3">
                🔽 GRUP / TUR SEÇİMİ:
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {groupStageFilters.map((groupName) => (
                  <button
                    key={groupName}
                    onClick={() => setStageFilter(groupName)}
                    className={`min-w-fit rounded-xl px-4 py-2 font-bold ${
                      stageFilter === groupName ? activeClass : passiveClass
                    }`}
                  >
                    Grup {groupName}
                  </button>
                ))}

                {knockoutFilters.map((stage) => (
                  <button
                    key={stage}
                    onClick={() => setStageFilter(stage)}
                    className={`min-w-fit rounded-xl px-4 py-2 font-bold ${
                      stageFilter === stage ? activeClass : passiveClass
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>

            {groupStageFilters.includes(stageFilter) && (
              <div>
                <div className="text-slate-400 font-bold mb-3">
                  🗓️ HAFTA / MAÇ AŞAMASI:
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {matchdayFilters.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setMatchdayFilter(item.value)}
                      className={`min-w-fit rounded-xl px-4 py-2 font-bold ${
                        matchdayFilter === item.value
                          ? activeClass
                          : passiveClass
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {matchChunks.length === 0 ? (
            <div className="rounded-2xl bg-[#0f172a] border border-slate-700 p-5 text-slate-400">
              Bu filtrede görünür tahmin yok. Tahminler maç başlamadan 15
              dakika önce herkese açılır.
            </div>
          ) : (
            matchChunks.map((chunk, index) => (
              <div
                key={index}
                className="overflow-x-auto rounded-2xl border border-slate-700"
              >
                <table className="w-full min-w-[900px] bg-[#0f172a]">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-4 text-slate-300">
                        Katılımcılar
                      </th>

                      {chunk.map((match) => (
                        <th
                          key={match.id}
                          colSpan="2"
                          className="p-4 text-center font-bold"
                        >
                          {match.home} - {match.away}
                        </th>
                      ))}
                    </tr>

                    <tr className="border-b border-slate-700">
                      <th></th>

                      {chunk.map((match) => (
                        <React.Fragment key={match.id}>
                          <th className="p-3 text-emerald-400">MS</th>
                          <th className="p-3 text-yellow-400">A/Ü</th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.username}
                        className="border-b border-slate-800"
                      >
                        <td className="p-4 font-bold">{user.username}</td>

                        {chunk.map((match) => {
                          const prediction = getPrediction(
                            user.username,
                            match.id
                          );
                          const odds = getMatchOdds(match.id);
                          const score = getMatchScore(match.id);

                          const msText = prediction
                            ? Number(prediction.ms) === 0
                              ? "X"
                              : prediction.ms
                            : "-";

                          const msOdd = getMsOdd(prediction, odds);
                          const ouOdd = getOuOdd(prediction, odds);

                          return (
                            <React.Fragment key={match.id}>
                              <td
                                className={`p-4 text-center font-bold ${getMsClass(
                                  prediction,
                                  score
                                )}`}
                              >
                                {prediction ? `${msText} (${msOdd})` : "-"}
                              </td>

                              <td
                                className={`p-4 text-center font-bold ${getOuClass(
                                  prediction,
                                  score
                                )}`}
                              >
                                {prediction
                                  ? `${prediction.ou} (${ouOdd})`
                                  : "-"}
                              </td>
                            </React.Fragment>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}

          <p className="text-sm text-slate-400 italic">
            ℹ️ Maç tahminleri maç başlamadan 15 dakika önce herkese açılır.
          </p>
        </>
      )}

      {tab !== "matches" && !showLongTermPredictions && (
        <div className="rounded-2xl bg-[#0f172a] border border-slate-700 p-5 text-slate-400">
          Uzun vadeli tahminler 11.06.2026 19:15’ten sonra herkese açılır.
        </div>
      )}

      {tab === "groupleaders" && showLongTermPredictions && (
        <div className="overflow-x-auto rounded-2xl border border-slate-700">
          <table className="w-full min-w-[1200px] bg-[#0f172a]">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="p-4 text-left">Katılımcı</th>

                {groupStageFilters.map((groupName) => (
                  <th key={groupName} className="p-4 text-center">
                    Grup {groupName}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.username} className="border-b border-slate-800">
                  <td className="p-4 font-bold">{user.username}</td>

                  {groupStageFilters.map((groupName) => {
                    const prediction = getGroupPrediction(
                      user.username,
                      groupName
                    );

                    const team = prediction?.team_name;
                    const odd = team ? getGroupOdd(groupName, team) : "-";

                    return (
                      <td
                        key={groupName}
                        className="p-4 text-center text-emerald-400 font-bold"
                      >
                        {team ? `${team} (${odd})` : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "champion" && showLongTermPredictions && (
        <div className="overflow-x-auto rounded-2xl border border-slate-700">
          <table className="w-full min-w-[700px] bg-[#0f172a]">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="p-4 text-left">Katılımcı</th>
                <th className="p-4 text-left">Şampiyon Tahmini</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => {
                const prediction = getChampionPrediction(user.username);
                const team = prediction?.team_name;
                const odd = team ? getChampionOdd(team) : "-";

                return (
                  <tr key={user.username} className="border-b border-slate-800">
                    <td className="p-4 font-bold">{user.username}</td>
                    <td className="p-4 text-emerald-400 font-bold">
                      {team ? `${team} (${odd})` : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "turkiye" && showLongTermPredictions && (
        <div className="overflow-x-auto rounded-2xl border border-slate-700">
          <table className="w-full min-w-[700px] bg-[#0f172a]">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="p-4 text-left">Katılımcı</th>
                <th className="p-4 text-left">Türkiye Tahmini</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => {
                const prediction = getTurkeyPrediction(user.username);
                const result = prediction?.result_name;
                const odd = result ? getTurkeyOdd(result) : "-";

                return (
                  <tr key={user.username} className="border-b border-slate-800">
                    <td className="p-4 font-bold">{user.username}</td>
                    <td className="p-4 text-yellow-400 font-bold">
                      {result ? `${result} (${odd})` : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
function GrupLiderleri() {
  const loggedInUser = localStorage.getItem("loggedInUser");
  const deadline = new Date("2026-06-11T19:00:00");
  const closed = new Date() >= deadline;

  const [myGroupPredictions, setMyGroupPredictions] = useState({});
  const [groupOdds, setGroupOdds] = useState({});

  useEffect(() => {
    fetchMyGroupPredictions();
    fetchGroupOdds();
  }, []);

  const fetchGroupOdds = async () => {
    const { data, error } = await supabase.from("group_odds").select("*");

    if (error) {
      console.log("Grup oranları alınamadı:", error);
      return;
    }

    const oddsObj = {};

    (data || []).forEach((item) => {
      oddsObj[`${item.group_name}-${item.team_name}`] = item.odd;
    });

    setGroupOdds(oddsObj);
  };

  const fetchMyGroupPredictions = async () => {
    const { data, error } = await supabase
      .from("group_predictions")
      .select("*")
      .eq("user_name", loggedInUser);

    if (error) {
      console.log("Grup tahminleri alınamadı:", error);
      return;
    }

    const predictionsObj = {};

    (data || []).forEach((item) => {
      predictionsObj[item.group_name] = item.team_name;
    });

    setMyGroupPredictions(predictionsObj);
  };

  const selectPrediction = (group, team) => {
    if (closed) return;

    setMyGroupPredictions((prev) => ({
      ...prev,
      [group]: team,
    }));
  };

  const saveGroupPredictions = async () => {
    if (closed) {
      alert("Grup birinciliği tahmin süresi kapandı.");
      return;
    }

    try {
      await supabase
        .from("group_predictions")
        .delete()
        .eq("user_name", loggedInUser);

      const rows = Object.entries(myGroupPredictions).map(
        ([groupName, teamName]) => ({
          user_name: loggedInUser,
          group_name: groupName,
          team_name: teamName,
        })
      );

      if (rows.length > 0) {
        const { error } = await supabase.from("group_predictions").insert(rows);

        if (error) {
          console.log(error);
          alert("Grup tahminleri kaydedilemedi.");
          return;
        }
      }

      alert("Grup birinciliği tahminlerin kaydedildi.");
    } catch (err) {
      console.log(err);
      alert("Grup tahminleri kaydedilirken hata oluştu.");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Grup Liderleri</h2>

      <div
        className={`rounded-xl px-4 py-3 text-sm font-bold ${
          closed
            ? "bg-red-500/10 text-red-400 border border-red-500/30"
            : "bg-slate-800 text-slate-300 border border-slate-700"
        }`}
      >
        ⏳ Son tahmin: 11.06.2026 19:00
        <div className="text-xs mt-1">
          {closed ? "Tahmin süresi kapandı" : "Tahmin süresi devam ediyor"}
        </div>
      </div>

      <button
        disabled={closed}
        onClick={saveGroupPredictions}
        className={`w-full rounded-xl py-3 font-bold ${
          closed
            ? "bg-slate-700 text-slate-400 cursor-not-allowed"
            : "bg-emerald-600"
        }`}
      >
        {closed ? "Tahmin Süresi Kapandı" : "Tahmini Kaydet"}
      </button>

      {Object.entries(groups).map(([groupName, teams]) => (
        <div
          key={groupName}
          className="rounded-2xl bg-[#0f172a] border border-slate-700 p-5"
        >
          <h3 className="font-bold mb-4 text-lg">Grup {groupName}</h3>

          <div className="space-y-3">
            {teams.map((team) => {
              const oddKey = `${groupName}-${team}`;
              const selected = myGroupPredictions[groupName] === team;

              return (
                <button
                  key={team}
                  disabled={closed}
                  onClick={() => selectPrediction(groupName, team)}
                  className={`w-full flex items-center justify-between gap-3 rounded-xl p-3 border ${
                    selected
                      ? "border-emerald-500 bg-emerald-600/20"
                      : closed
                      ? "border-slate-700 bg-slate-800 opacity-60 cursor-not-allowed"
                      : "border-slate-700 bg-slate-800"
                  }`}
                >
                  <span className="font-semibold">{team}</span>
                  <span className="text-emerald-400 font-bold">
                    {groupOdds[oddKey] || "-"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
function Sampiyon() {
  const loggedInUser = localStorage.getItem("loggedInUser");
  const deadline = new Date("2026-06-11T19:00:00");
  const closed = new Date() >= deadline;

  const [myChampion, setMyChampion] = useState("");
  const [championOdds, setChampionOdds] = useState({});

  useEffect(() => {
    fetchMyChampionPrediction();
    fetchChampionOdds();
  }, []);

  const fetchChampionOdds = async () => {
    const { data, error } = await supabase.from("champion_odds").select("*");

    if (error) {
      console.log("Şampiyonluk oranları alınamadı:", error);
      return;
    }

    const oddsObj = {};

    (data || []).forEach((item) => {
      oddsObj[item.team_name] = item.odd;
    });

    setChampionOdds(oddsObj);
  };

  const fetchMyChampionPrediction = async () => {
    const { data, error } = await supabase
      .from("champion_predictions")
      .select("*")
      .eq("user_name", loggedInUser)
      .limit(1);

    if (error) {
      console.log("Şampiyon tahmini alınamadı:", error);
      return;
    }

    if (data && data.length > 0) {
      setMyChampion(data[0].team_name);
    }
  };

  const selectChampion = (team) => {
    if (closed) return;
    setMyChampion(team);
  };

  const saveChampionPrediction = async () => {
    if (closed) {
      alert("Şampiyonluk tahmin süresi kapandı.");
      return;
    }

    if (!myChampion) {
      alert("Lütfen şampiyonluk tahmini seç.");
      return;
    }

    try {
      await supabase
        .from("champion_predictions")
        .delete()
        .eq("user_name", loggedInUser);

      const { error } = await supabase.from("champion_predictions").insert({
        user_name: loggedInUser,
        team_name: myChampion,
      });

      if (error) {
        console.log(error);
        alert("Şampiyonluk tahmini kaydedilemedi.");
        return;
      }

      alert("Şampiyonluk tahminin kaydedildi.");
    } catch (err) {
      console.log(err);
      alert("Şampiyonluk tahmini kaydedilirken hata oluştu.");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Şampiyon</h2>

      <div
        className={`rounded-xl px-4 py-3 text-sm font-bold ${
          closed
            ? "bg-red-500/10 text-red-400 border border-red-500/30"
            : "bg-slate-800 text-slate-300 border border-slate-700"
        }`}
      >
        ⏳ Son tahmin: 11.06.2026 19:00
        <div className="text-xs mt-1">
          {closed ? "Tahmin süresi kapandı" : "Tahmin süresi devam ediyor"}
        </div>
      </div>

      <button
        disabled={closed}
        onClick={saveChampionPrediction}
        className={`w-full rounded-xl py-3 font-bold ${
          closed
            ? "bg-slate-700 text-slate-400 cursor-not-allowed"
            : "bg-emerald-600"
        }`}
      >
        {closed ? "Tahmin Süresi Kapandı" : "Tahmini Kaydet"}
      </button>

      <div className="rounded-2xl bg-[#0f172a] border border-slate-700 p-5">
        <div className="space-y-3">
          {allTeams.map((team) => {
            const selected = myChampion === team;

            return (
              <button
                key={team}
                disabled={closed}
                onClick={() => selectChampion(team)}
                className={`w-full flex items-center justify-between gap-3 rounded-xl p-3 border ${
                  selected
                    ? "border-emerald-500 bg-emerald-600/20"
                    : closed
                    ? "border-slate-700 bg-slate-800 opacity-60 cursor-not-allowed"
                    : "border-slate-700 bg-slate-800"
                }`}
              >
                <span className="font-semibold">{team}</span>
                <span className="text-emerald-400 font-bold">
                  {championOdds[team] || "-"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
function Turkiye() {
  const loggedInUser = localStorage.getItem("loggedInUser");

  const [odds, setOdds] = useState([]);
  const [selectedResult, setSelectedResult] = useState("");

  const deadline = new Date("2026-06-11T18:45:00");
  const closed = new Date() >= deadline;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: oddsData } = await supabase
      .from("turkey_odds")
      .select("*");

    setOdds(oddsData || []);

    const { data: predictionData } = await supabase
      .from("turkey_predictions")
      .select("*")
      .eq("user_name", loggedInUser)
      .limit(1);

    if (predictionData?.length > 0) {
      setSelectedResult(predictionData[0].result_name);
    }
  };

  const savePrediction = async () => {
    if (!selectedResult) {
      alert("Bir tahmin seç.");
      return;
    }

    await supabase
      .from("turkey_predictions")
      .delete()
      .eq("user_name", loggedInUser);

    const { error } = await supabase
      .from("turkey_predictions")
      .insert({
        user_name: loggedInUser,
        result_name: selectedResult,
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Türkiye tahmini kaydedildi.");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Türkiye</h2>

      <div className="rounded-xl px-4 py-3 bg-slate-800 border border-slate-700">
        ⏳ Son tahmin: 11.06.2026 18:45
      </div>

      <button
        disabled={closed}
        onClick={savePrediction}
        className="w-full rounded-xl py-3 font-bold bg-emerald-600"
      >
        Tahmini Kaydet
      </button>

      <div className="rounded-2xl bg-[#0f172a] border border-slate-700 p-5">
        <div className="space-y-3">
          {odds.map((item) => {
            const selected =
              selectedResult === item.result_name;

            return (
              <button
                key={item.result_name}
                disabled={closed}
                onClick={() =>
                  setSelectedResult(item.result_name)
                }
                className={`w-full flex justify-between rounded-xl p-3 border ${
                  selected
                    ? "border-emerald-500 bg-emerald-600/20"
                    : "border-slate-700 bg-slate-800"
                }`}
              >
                <span>{item.result_name}</span>

                <span className="text-emerald-400 font-bold">
                  {item.odd}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AdminPanel() {
  const [customMatches, setCustomMatches] = useState(
    JSON.parse(localStorage.getItem("customMatches")) || []
  );

  const [newMatch, setNewMatch] = useState({
    stage: "Son 32",
    home: "",
    away: "",
    date: "",
    dateOrder: "",
    time: "",
  });

  const [matchOdds, setMatchOdds] = useState(
    JSON.parse(localStorage.getItem("matchOdds")) || {}
  );

  const [matchScores, setMatchScores] = useState(
    JSON.parse(localStorage.getItem("matchScores")) || {}
  );

  const [groupOdds, setGroupOdds] = useState(
    JSON.parse(localStorage.getItem("groupOdds")) || {}
  );

  const [realGroupWinners, setRealGroupWinners] = useState(
    JSON.parse(localStorage.getItem("realGroupWinners")) || {}
  );

  const [turkeyOdds, setTurkeyOdds] = useState({});
const [realTurkeyResult, setRealTurkeyResult] = useState("");

  const [championOdds, setChampionOdds] = useState(
    JSON.parse(localStorage.getItem("championOdds")) || {}
  );

  const [realChampion, setRealChampion] = useState(
    localStorage.getItem("realChampion") || ""
  );

  const allMatches = [...matches, ...customMatches];

const saveAll = async () => {
  try {
    // 1) Maç oranları
    for (const [matchId, odds] of Object.entries(matchOdds)) {
      await supabase.from("match_odds").delete().eq("match_id", Number(matchId));

      await supabase.from("match_odds").insert({
        match_id: Number(matchId),
        ms1: Number(odds.ms1 || 0),
        ms0: Number(odds.ms0 || 0),
        ms2: Number(odds.ms2 || 0),
        under: Number(odds.under || 0),
        over: Number(odds.over || 0),
      });
    }

    // 2) Maç skorları
    for (const [matchId, score] of Object.entries(matchScores)) {
      await supabase.from("match_scores").delete().eq("match_id", Number(matchId));

      await supabase.from("match_scores").insert({
        match_id: Number(matchId),
        home_score: Number(score.home || 0),
        away_score: Number(score.away || 0),
      });
    }

    // 3) Grup lideri oranları
    for (const [key, odd] of Object.entries(groupOdds)) {
      const [groupName, teamName] = key.split("-");

      await supabase
        .from("group_odds")
        .delete()
        .eq("group_name", groupName)
        .eq("team_name", teamName);

      await supabase.from("group_odds").insert({
        group_name: groupName,
        team_name: teamName,
        odd: Number(odd || 0),
      });
    }

    // 4) Gerçek grup liderleri
    for (const [groupName, winner] of Object.entries(realGroupWinners)) {
      if (!winner) continue;

      await supabase
        .from("real_group_winners")
        .delete()
        .eq("group_name", groupName);

      await supabase.from("real_group_winners").insert({
        group_name: groupName,
        winner,
      });
    }

    // 5) Şampiyonluk oranları
    for (const [teamName, odd] of Object.entries(championOdds)) {
      await supabase
        .from("champion_odds")
        .delete()
        .eq("team_name", teamName);

      await supabase.from("champion_odds").insert({
        team_name: teamName,
        odd: Number(odd || 0),
      });
    }

    // 6) Gerçek şampiyon
    await supabase.from("real_champion").delete().neq("id", 0);

    if (realChampion) {
      await supabase.from("real_champion").insert({
        champion: realChampion,
      });
    }

    for (const [resultName, odd] of Object.entries(turkeyOdds)) {
  await supabase
    .from("turkey_odds")
    .delete()
    .eq("result_name", resultName);

  await supabase.from("turkey_odds").insert({
    result_name: resultName,
    odd: Number(odd || 0),
  });
}

await supabase.from("real_turkey_result").delete().neq("id", 0);

if (realTurkeyResult) {
  await supabase.from("real_turkey_result").insert({
    result_name: realTurkeyResult,
  });
}

    alert("Tüm admin bilgileri Supabase'e kaydedildi.");
  } catch (err) {
    console.log("Admin kayıt hatası:", err);
    alert("Kayıt sırasında hata oluştu.");
  }
};
  const addCustomMatch = () => {
    if (
      !newMatch.stage ||
      !newMatch.home ||
      !newMatch.away ||
      !newMatch.date ||
      !newMatch.dateOrder ||
      !newMatch.time
    ) {
      alert("Lütfen maç ekleme alanındaki tüm bilgileri doldur.");
      return;
    }

    const createdMatch = {
      id: Date.now(),
      isCustom: true,
      stage: newMatch.stage,
      group: "",
      matchday: "",
      date: newMatch.date,
      dateOrder: newMatch.dateOrder,
      time: newMatch.time,
      home: newMatch.home,
      away: newMatch.away,
      odds: { ms1: "", ms0: "", ms2: "", over: "", under: "" },
      score: { home: "", away: "" },
    };

    const updated = [...customMatches, createdMatch];

    setCustomMatches(updated);
    localStorage.setItem("customMatches", JSON.stringify(updated));

    setNewMatch({
      stage: "Son 32",
      home: "",
      away: "",
      date: "",
      dateOrder: "",
      time: "",
    });

    alert("Yeni maç eklendi.");
  };

  const deleteCustomMatch = (matchId) => {
    const confirmed = confirm("Bu maçı silmek istiyor musun?");

    if (!confirmed) return;

    const updated = customMatches.filter((match) => match.id !== matchId);

    setCustomMatches(updated);
    localStorage.setItem("customMatches", JSON.stringify(updated));

    alert("Maç silindi.");
  };

  const updateMatchOdd = (matchId, key, value) => {
    setMatchOdds((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [key]: value,
      },
    }));
  };

  const updateMatchScore = (matchId, key, value) => {
    setMatchScores((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [key]: value,
      },
    }));
  };

  const updateGroupOdd = (group, team, value) => {
    setGroupOdds((prev) => ({
      ...prev,
      [`${group}-${team}`]: value,
    }));
  };

  const updateChampionOdd = (team, value) => {
    setChampionOdds((prev) => ({
      ...prev,
      [team]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Admin Paneli</h2>

        <button
          onClick={saveAll}
          className="bg-emerald-600 px-5 py-3 rounded-xl font-bold"
        >
          Tümünü Kaydet
        </button>
      </div>

      <div className="rounded-2xl bg-[#0f172a] border border-slate-700 p-5 space-y-4">
        <h3 className="text-lg font-bold">Yeni Maç Ekle</h3>

        <select
          value={newMatch.stage}
          onChange={(e) =>
            setNewMatch((prev) => ({ ...prev, stage: e.target.value }))
          }
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none"
        >
          <option>Son 32</option>
          <option>Son 16</option>
          <option>Çeyrek Final</option>
          <option>Yarı Final</option>
          <option>Üçüncülük</option>
          <option>Final</option>
        </select>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <select
            value={newMatch.home}
            onChange={(e) =>
              setNewMatch((prev) => ({ ...prev, home: e.target.value }))
            }
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none"
          >
            <option value="">Ev sahibi takım</option>
            {allTeams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>

          <select
            value={newMatch.away}
            onChange={(e) =>
              setNewMatch((prev) => ({ ...prev, away: e.target.value }))
            }
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none"
          >
            <option value="">Deplasman takım</option>
            {allTeams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>

        <input
          type="text"
          placeholder="Görünen tarih: 30 Haziran 2026"
          value={newMatch.date}
          onChange={(e) =>
            setNewMatch((prev) => ({ ...prev, date: e.target.value }))
          }
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none"
        />

        <input
          type="date"
          value={newMatch.dateOrder}
          onChange={(e) =>
            setNewMatch((prev) => ({ ...prev, dateOrder: e.target.value }))
          }
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none"
        />

        <input
          type="time"
          value={newMatch.time}
          onChange={(e) =>
            setNewMatch((prev) => ({ ...prev, time: e.target.value }))
          }
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none"
        />

        <button
          onClick={addCustomMatch}
          className="w-full bg-emerald-600 rounded-xl py-3 font-bold"
        >
          Maçı Ekle
        </button>
      </div>

      <div className="rounded-2xl bg-[#0f172a] border border-slate-700 p-5 space-y-4">
        <h3 className="text-lg font-bold">Maç Oranları ve Skorları</h3>

        {allMatches.map((match) => {
          const odds = matchOdds[match.id] || {};
          const score = matchScores[match.id] || {};

          return (
            <div key={match.id} className="bg-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="text-sm text-slate-400">
                  {match.stage === "Grup"
                    ? `Grup ${match.group} • ${match.matchday}. Maç`
                    : match.stage}{" "}
                  • {match.date} - {match.time}
                </div>

                {match.isCustom && (
                  <button
                    onClick={() => deleteCustomMatch(match.id)}
                    className="text-red-400 text-sm underline"
                  >
                    Sil
                  </button>
                )}
              </div>

              <div className="font-bold mb-3">
                {match.home} - {match.away}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="MS1"
                  value={odds.ms1 || ""}
                  onChange={(e) =>
                    updateMatchOdd(match.id, "ms1", e.target.value)
                  }
                  className="bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none"
                />

                <input
                  type="number"
                  step="0.01"
                  placeholder="MSX"
                  value={odds.ms0 || ""}
                  onChange={(e) =>
                    updateMatchOdd(match.id, "ms0", e.target.value)
                  }
                  className="bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none"
                />

                <input
                  type="number"
                  step="0.01"
                  placeholder="MS2"
                  value={odds.ms2 || ""}
                  onChange={(e) =>
                    updateMatchOdd(match.id, "ms2", e.target.value)
                  }
                  className="bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Alt"
                  value={odds.under || ""}
                  onChange={(e) =>
                    updateMatchOdd(match.id, "under", e.target.value)
                  }
                  className="bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none"
                />

                <input
                  type="number"
                  step="0.01"
                  placeholder="Üst"
                  value={odds.over || ""}
                  onChange={(e) =>
                    updateMatchOdd(match.id, "over", e.target.value)
                  }
                  className="bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder={`${match.home} skor`}
                  value={score.home || ""}
                  onChange={(e) =>
                    updateMatchScore(match.id, "home", e.target.value)
                  }
                  className="bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none"
                />

                <input
                  type="number"
                  placeholder={`${match.away} skor`}
                  value={score.away || ""}
                  onChange={(e) =>
                    updateMatchScore(match.id, "away", e.target.value)
                  }
                  className="bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-[#0f172a] border border-slate-700 p-5 space-y-4">
        <h3 className="text-lg font-bold">Grup Lideri Oranları ve Sonuçları</h3>

        {Object.entries(groups).map(([groupName, teams]) => (
          <div key={groupName} className="bg-slate-800 rounded-xl p-4">
            <div className="font-bold mb-3">Grup {groupName}</div>

            <select
              value={realGroupWinners[groupName] || ""}
              onChange={(e) =>
                setRealGroupWinners((prev) => ({
                  ...prev,
                  [groupName]: e.target.value,
                }))
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 mb-3 outline-none"
            >
              <option value="">Gerçek grup lideri seç</option>

              {teams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>

            <div className="space-y-2">
              {teams.map((team) => (
                <div
                  key={team}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="font-semibold">{team}</span>

                  <input
                    type="number"
                    step="0.01"
                    placeholder="Oran"
                    value={groupOdds[`${groupName}-${team}`] || ""}
                    onChange={(e) =>
                      updateGroupOdd(groupName, team, e.target.value)
                    }
                    className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-[#0f172a] border border-slate-700 p-5 space-y-4">
        <h3 className="text-lg font-bold">Şampiyonluk Oranları ve Sonuç</h3>

        <select
          value={realChampion}
          onChange={(e) => setRealChampion(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none"
        >
          <option value="">Gerçek şampiyon seç</option>

          {allTeams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>

        <div className="space-y-2">
          {allTeams.map((team) => (
            <div key={team} className="flex items-center justify-between gap-3">
              <span className="font-semibold">{team}</span>

              <input
                type="number"
                step="0.01"
                placeholder="Oran"
                value={championOdds[team] || ""}
                onChange={(e) => updateChampionOdd(team, e.target.value)}
                className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-[#0f172a] border border-slate-700 p-5 space-y-4">
  <h3 className="text-lg font-bold">Türkiye Nasıl Tamamlar?</h3>

  <select
    value={realTurkeyResult}
    onChange={(e) => setRealTurkeyResult(e.target.value)}
    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none"
  >
    <option value="">Gerçek Türkiye sonucunu seç</option>

    {turkeyResults.map((result) => (
      <option key={result} value={result}>
        {result}
      </option>
    ))}
  </select>

  <div className="space-y-2">
    {turkeyResults.map((result) => (
      <div key={result} className="flex items-center justify-between gap-3">
        <span className="font-semibold">{result}</span>

        <input
          type="number"
          step="0.01"
          placeholder="Oran"
          value={turkeyOdds[result] || ""}
          onChange={(e) =>
            setTurkeyOdds((prev) => ({
              ...prev,
              [result]: e.target.value,
            }))
          }
          className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none"
        />
      </div>
    ))}
  </div>
</div>
    </div>
  );
}

async function seedMatchesToSupabase() {
  const { data: existingMatches } = await supabase
    .from("matches")
    .select("id");

  if (existingMatches && existingMatches.length > 0) {
    console.log("Maçlar zaten yüklü.");
    return;
  }

  const rows = matches.map((match) => ({
    id: Number(match.id),
    home: match.home,
    away: match.away,
    group_name: match.group || "",
    stage: match.stage,
    matchday: Number(match.matchday || 0),
    date: match.date,
    date_order: match.dateOrder,
    time: match.time,
  }));

  const { error } = await supabase.from("matches").insert(rows);

  if (error) {
    console.log("Maç yükleme hatası:", error);
    alert("Maçlar yüklenemedi.");
    return;
  }

  alert("Grup maçları Supabase'e yüklendi.");
}
function App() {
  const [loggedInUser, setLoggedInUser] = useState(
    localStorage.getItem("loggedInUser")
  );

  useEffect(() => {
    seedMatchesToSupabase();
  }, []);

  const handleLogin = (username) => {
    localStorage.setItem("loggedInUser", username);
    setLoggedInUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("isAdmin");
    setLoggedInUser(null);
  };

  const handleChangePassword = () => {
    alert("Şifre değiştirme kısmını birazdan Supabase'e bağlayacağız.");
  };

  if (!loggedInUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Layout
        loggedInUser={loggedInUser}
        onLogout={handleLogout}
        onChangePassword={handleChangePassword}
      />
    </BrowserRouter>
  );
}
export default App;