import dayjs from "dayjs";
export default async function setDayjsLocale(localeCode: string) {
  try {
    if (localeCode !== "en") {
      await import(`dayjs/locale/${localeCode}.js`);
    }
    dayjs.locale(localeCode);
  } catch (error) {
    console.error(`Failed to load Day.js locale '${localeCode}':`, error);
  }
}
