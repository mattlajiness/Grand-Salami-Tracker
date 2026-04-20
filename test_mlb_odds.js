
async function test() {
  const gamePk = 746481; // Replace with a current or recent game ID
  const url = `https://statsapi.mlb.com/api/v1/game/${gamePk}/contextMetrics?hydrate=odds`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
test();
