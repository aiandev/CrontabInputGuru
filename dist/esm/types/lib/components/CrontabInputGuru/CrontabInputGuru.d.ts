import React from "react";
import "./cron.scss";
export interface CrontabInputProps {
    locale: 'en' | 'zh_CN';
    value: string;
    onChange: (value: string) => void;
}
declare const CrontabInputGuru: React.FC<CrontabInputProps>;
export default CrontabInputGuru;
