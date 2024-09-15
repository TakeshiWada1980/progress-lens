import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.locale("ja");
dayjs.extend(utc);
dayjs.extend(timezone);

const datetime2str = (datetime: Date, format?: string) => {
  return dayjs(datetime)
    .tz("Asia/Tokyo")
    .format(format || "YYYY/MM/DD HH:mm:ss");
};

export default datetime2str;
