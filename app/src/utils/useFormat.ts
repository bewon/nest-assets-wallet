import { useTranslation } from "next-i18next";

export const defaultCurrency = "PLN";
export const defaultDateFormat = "YYYY-MM-DD";

const useFormat = () => {
  const { i18n } = useTranslation();

  const dateFormat = (
    date: Date,
    options?: Intl.DateTimeFormatOptions,
  ): string => {
    return date.toLocaleDateString(i18n.language, options);
  };

  const percentFormat = (
    number: number,
    maximumFractionDigits: number,
    showPlusSign?: boolean,
  ): string => {
    const options: Intl.NumberFormatOptions = {
      style: "percent",
      maximumFractionDigits,
    };
    const formatted = new Intl.NumberFormat(i18n.language, options).format(
      number,
    );
    return showPlusSign && number > 0 ? `+${formatted}` : formatted;
  };

  const amountFormat = (
    number?: number,
    maximumFractionDigits?: number,
    showPlusSign?: boolean,
  ): string | null => {
    if (number === undefined) {
      return null;
    }
    const options: Intl.NumberFormatOptions = {
      style: "currency",
      currency: defaultCurrency,
    };
    if (maximumFractionDigits !== undefined) {
      options.maximumFractionDigits = maximumFractionDigits;
      options.minimumFractionDigits = maximumFractionDigits;
    }
    const formatted = new Intl.NumberFormat(i18n.language, options).format(
      number,
    );
    return showPlusSign && number > 0 ? `+${formatted}` : formatted;
  };

  return {
    dateFormat,
    percentFormat,
    amountFormat,
  };
};

export default useFormat;
