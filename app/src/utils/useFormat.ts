import { useTranslation } from "next-i18next";

export const defaultCurrency = "PLN";

const useFormat = () => {
  const { i18n } = useTranslation();

  const dateFormat = (
    date: Date,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    return date.toLocaleDateString(i18n.language, options);
  };

  const percentFormat = (
    number: number,
    maximumFractionDigits: number
  ): string => {
    const options: Intl.NumberFormatOptions = {
      style: "percent",
      maximumFractionDigits,
    };
    return new Intl.NumberFormat(i18n.language, options).format(number);
  };

  const amountFormat = (
    number?: number,
    maximumFractionDigits?: number
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
    return new Intl.NumberFormat(i18n.language, options).format(number);
  };

  return {
    dateFormat,
    percentFormat,
    amountFormat,
  };
};

export default useFormat;
