import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChalkboardUser,
  faEllipsisVertical,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";

const BeginnersGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2 break-words text-justify">
        <p className="indent-paragraph text-slate-500">
          Microsoft Forms や Google Forms における「<b>フォーム</b>
          」を、ここでは「
          <strong>ラーニングセッション</strong>
          」と呼びます。
          通常、授業ごとにひとつのラーニングセッションを作成して使用します。
        </p>
      </div>

      <div className="flex w-full flex-col gap-x-4 gap-y-3 px-5 md:flex-row md:items-start">
        <div className="w-full md:w-1/2">
          <div className="text-sm font-bold text-indigo-500">
            <FontAwesomeIcon icon={faChalkboardUser} className="mr-1" />
            ラーニングセッション
          </div>
          <div className="mt-0.5 rounded-md bg-indigo-400 px-3 py-2">
            <div className=" text-white">
              <div>第03回 プログラミング基礎演習</div>
              <ul className="ml-2 mt-1 text-sm">
                <li>
                  <FontAwesomeIcon
                    icon={faCommentDots}
                    flip="horizontal"
                    className="mr-2"
                  />
                  演習1の進捗状況は?
                </li>
                <li>
                  <FontAwesomeIcon
                    icon={faCommentDots}
                    flip="horizontal"
                    className="mr-2"
                  />
                  演習2の進捗状況は?
                </li>
                <li>
                  <FontAwesomeIcon
                    icon={faCommentDots}
                    flip="horizontal"
                    className="mr-2"
                  />
                  演習3の進捗状況は?
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <div className="text-sm font-bold text-indigo-500">
            <FontAwesomeIcon icon={faChalkboardUser} className="mr-1" />
            ラーニングセッション
          </div>
          <div className="mt-0.5 rounded-md bg-indigo-400 px-3 py-2">
            <div className="text-white">
              <div>第06回 データベース工学</div>
              <ul className="ml-2 mt-1 text-sm">
                <li>
                  <FontAwesomeIcon
                    icon={faCommentDots}
                    flip="horizontal"
                    className="mr-2"
                  />
                  第2正規形の現在の理解度は?
                </li>
                <li>
                  <FontAwesomeIcon
                    icon={faCommentDots}
                    flip="horizontal"
                    className="mr-2"
                  />
                  第3正規形の現在の理解度は?
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 break-words text-justify">
        <p className="indent-paragraph">
          ラーニングセッションを作成するためには、右上の「
          <strong>新規作成</strong>」のボタンを押下するか、
          既存のラーニングセッションの右端の
          <FontAwesomeIcon icon={faEllipsisVertical} className="mx-2" />
          をクリックして「<strong>複製</strong>」を選択します。
        </p>
      </div>
    </div>
  );
};

export default BeginnersGuide;
