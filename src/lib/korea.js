/**
 * history.js の記録から、韓国の滞在をまとめる（「自分について」の KOREA LOG 用）。
 * 対象は「韓国にN日間滞在（都市・都市…）」と書いた記録。
 */
import { hangulNames } from '../data/korea.js';

const STAY = /韓国に(\d+)日間滞在（([^）]+)）/;

/** @returns {{ trips: number, days: number, cities: { name: string, hangul: string, count: number }[] }} */
export function getKoreaLog(history) {
  const stays = history.map((item) => item.text.match(STAY)).filter(Boolean);
  const cities = new Map(); // 初めて訪れた順
  for (const [, , list] of stays) {
    for (const name of list.split('・').map((s) => s.trim()).filter(Boolean)) {
      const city = cities.get(name) ?? { name, hangul: hangulNames[name] ?? '', count: 0 };
      city.count += 1;
      cities.set(name, city);
    }
  }
  return {
    trips: stays.length,
    days: stays.reduce((sum, [, days]) => sum + Number(days), 0),
    cities: [...cities.values()],
  };
}
