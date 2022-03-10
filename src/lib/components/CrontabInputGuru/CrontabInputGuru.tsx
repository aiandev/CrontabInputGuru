import React, { useState, useEffect, useCallback, useRef } from "react";
import cronstrue from "cronstrue/i18n";
import Cron from "cron-converter";
import valueHints from "./valueHints";
import "./cron.scss";
import locales from "./locales";

export interface CrontabInputProps{
  locale:'en'|'zh_CN',
  value:string,
  onChange:(value:string) => void
}

const CrontabInputGuru: React.FC<CrontabInputProps> = ({value , locale , onChange}) => {

  const [parsed, setParsed] = useState<any>('');
  const [highlightedExplanation, setHighlightedExplanation] = useState<string|undefined>("");

  const [isValid, setIsValid] = useState(true);
  const [selectedPartIndex, setSelectedPartIndex] = useState(-1);
  const [nextSchedules, setNextSchedules] = useState<any>([]);
  const [nextExpanded, setNextExpanded] = useState(false);
  const [lastCaretPosition, setLastCaretPosition] = useState<number | null >(-1);
  const  inputRef = useRef<any>(null)

  // const clearCaretPosition = () => {
  //   lastCaretPosition = -1;
  //   setSelectedPartIndex(-1)
  //   setHighlightedExplanation(highlightParsed(-1))
  // };
  
  const calculateNext = useCallback(() => {
    let nextSchedulesValue = [];
    try {
      let cronInstance = new Cron();
      cronInstance.fromString(value);
      let timePointer = new Date();
      for (let i = 0; i < 5; i++) {
        let schedule = cronInstance.schedule(timePointer);
        let next = schedule.next();
        nextSchedulesValue.push(next.format("YYYY-MM-DD HH:mm:ss"));
        timePointer = next.add(1000, 'milliseconds').toDate();
      }
    } catch (e) {}

    setNextSchedules(nextSchedulesValue);
  },[value]);

  const highlightParsed = useCallback((selectedPartIndex:number) => {
    let parsedValue = parsed;

    if (!parsedValue) {
      return;
    }

    let toHighlight = [];
    let highlighted = "";

    for (let i = 0; i < 5; i++) {
      if (
        parsedValue &&
        parsedValue.segments &&
        parsedValue.segments[i] &&
        parsedValue.segments[i].text
      ) {
        toHighlight.push({ ...parsedValue.segments[i] });
      } else {
        toHighlight.push(null);
      }
    }

    if (selectedPartIndex >= 0) {
      if (toHighlight[selectedPartIndex]) {
        toHighlight[selectedPartIndex].active = true;
      }
    }

    // handle special case where minute/hour is presented in the same segment
    if (
      toHighlight[0] &&
      toHighlight[1] &&
      toHighlight[0].text &&
      toHighlight[0].text === toHighlight[1].text &&
      toHighlight[0].start === toHighlight[1].start
    ) {
      if (toHighlight[1].active) {
        toHighlight[0] = null;
      } else {
        toHighlight[1] = null;
      }
    }

    toHighlight = toHighlight.filter((_) => _);

    toHighlight.sort((a, b) => {
      return a.start - b.start;
    });

    let pointer = 0;
    toHighlight.forEach((item) => {
      if (pointer > item.start) {
        return;
      }
      highlighted += parsedValue.description.substring(pointer, item.start);
      pointer = item.start;
      highlighted += `<span${
        item.active ? ' class="active"' : ""
      }>${parsedValue.description.substring(
        pointer,
        pointer + item.text.length
      )}</span>`;
      pointer += item.text.length;
    });

    highlighted += parsedValue.description?.substring(pointer);

    return highlighted;
  },[parsed]);


  const calculateExplanation = useCallback(
    (callback?:Function) => {
      let isValidValue = true;
      let parsedValue;
      let highlightedExplanationValue;
      try {
        highlightedExplanationValue = "";
        parsedValue = cronstrue.toString(value, { locale: locale });
        highlightedExplanationValue = parsedValue;
      } catch (e) {
        highlightedExplanationValue = (e as string).toString();
        isValidValue = false;
        // console.log(highlightedExplanationValue)
      }
  
      Promise.all([
        setParsed(parsedValue),
        setIsValid(isValidValue),
        setHighlightedExplanation(highlightedExplanationValue),
      ]).then(() => {
        if (isValid) {
          // setHighlightedExplanation(highlightParsed(-1));
        }
        if (callback) {
          callback();
        }
      });
    },[isValid,locale, value]);

  useEffect(() => {
    calculateNext();
    calculateExplanation();
  }, [calculateNext, calculateExplanation]);
  
  const onCaretPositionChange = useCallback(() => {
    
    if (!inputRef) {
      return;
    }
    let caretPosition = inputRef.current.selectionStart;
    let selected = value.substring(
      inputRef.current.selectionStart|| 0,
      inputRef.current.selectionEnd|| 0
    );
    if (selected.indexOf(" ") >= 0) {
      caretPosition = -1;
    }
    
    if (lastCaretPosition === caretPosition) {
      return;
    }

    setLastCaretPosition(caretPosition);

    if (caretPosition === -1) {
      setHighlightedExplanation(highlightParsed(-1));
      setSelectedPartIndex(-1);

      return;
    }

    let textBeforeCaret = value.substring(0, caretPosition||value.length);
    let selectedPartIndexValue = textBeforeCaret.split(" ").length - 1;

    setSelectedPartIndex(selectedPartIndexValue);
  },[highlightParsed, lastCaretPosition, value]);

  const getLocale = () => {
    return locales[locale];
  };

  useEffect(() => {
    setTimeout(() => {
      calculateExplanation((): void => {
        onCaretPositionChange();
        calculateNext();
      });
    });
  }, [calculateExplanation, onCaretPositionChange ,calculateNext ]);

  return (
    <div className="crontab-input">
      <div
        className="explanation"
        dangerouslySetInnerHTML={{
          __html: isValid ? `“${highlightedExplanation}”` : "　",
        }}
      />

      {/* <div className="explanation">{isValid ? highlightedExplanation : "　"}</div> */}

      <div className="next">
        {!!nextSchedules.length && (
          <span>
            {getLocale().nextTime}: {nextSchedules[0]}{" "}
            {nextExpanded ? (
              <button  onClick={() => setNextExpanded(false)}>({getLocale().hide})</button>
            ) : (
              <button onClick={() => setNextExpanded(true)}>
                ({getLocale().showMore})
              </button>
            )}
            {!!nextExpanded && (
              <div className="next-items">
                {nextSchedules.slice(1).map((item:any, index:any) => (
                  <div className="next-item" key={index}>
                    {getLocale().then}: {item}
                  </div>
                ))}
              </div>
            )}
          </span>
        )}
      </div>

      <input
        type="text"
        className={"cron-input " + (!isValid ? "error" : "")}
        value={value}
        ref={inputRef}
        onMouseUp={(e) => {
          onCaretPositionChange();
        }}
        //  onKeyUp={e => {
        //    onCaretPositionChange()
        //  }}
        //  onBlur={e => {
        //    clearCaretPosition()
        //  }}
        onChange={(e) => {
          let parts = e.target.value.split(" ").filter((_) => _);
          if (parts.length !== 5) {
            onChange(e.target.value);
            setParsed('');
            setIsValid(false);
            return;
          }

          onChange(e.target.value);
        }}
      />

      <div className="parts">
        {[
          getLocale().minute,
          getLocale().hour,
          getLocale().dayMonth,
          getLocale().month,
          getLocale().dayWeek,
        ].map((unit, index) => (
          <div
            key={index}
            className={
              "part " + (selectedPartIndex === index ? "selected" : "")
            }
          >
            {unit}
          </div>
        ))}
      </div>

      {valueHints[locale][selectedPartIndex] && (
        <div className="allowed-values">
          {valueHints[locale][selectedPartIndex].map((value:any, index:any) => (
            <div className="value" key={index}>
              <div className="key">{value[0]}</div>
              <div className="value">{value[1]}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

CrontabInputGuru.defaultProps = {
  locale: "en",
};

export default CrontabInputGuru;
