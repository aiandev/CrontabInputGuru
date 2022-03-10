"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CrontabInput = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.array.sort.js");

require("core-js/modules/es.symbol.description.js");

require("core-js/modules/es.regexp.to-string.js");

require("core-js/modules/es.promise.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.split.js");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _i18n = _interopRequireDefault(require("cronstrue/i18n"));

var _cronConverter = _interopRequireDefault(require("cron-converter"));

var _valueHints = _interopRequireDefault(require("./valueHints"));

require("./cron.scss");

var _locales = _interopRequireDefault(require("./locales"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const CrontabInput = /*#__PURE__*/_react.default.memo(props => {
  const [parsed, setParsed] = (0, _react.useState)({});
  const [highlightedExplanation, setHighlightedExplanation] = (0, _react.useState)(" ");
  const [isValid, setIsValid] = (0, _react.useState)(true);
  const [selectedPartIndex, setSelectedPartIndex] = (0, _react.useState)(-1);
  const [nextSchedules, setNextSchedules] = (0, _react.useState)([]);
  const [nextExpanded, setNextExpanded] = (0, _react.useState)(false);
  let inputRef;
  let lastCaretPosition = -1;
  (0, _react.useEffect)(() => {
    calculateNext();
    calculateExplanation();
  }, []); // const clearCaretPosition = () => {
  //   lastCaretPosition = -1;
  //   setSelectedPartIndex(-1)
  //   setHighlightedExplanation(highlightParsed(-1))
  // };

  const calculateNext = () => {
    let nextSchedulesValue = [];

    try {
      let cronInstance = new _cronConverter.default();
      cronInstance.fromString(props.value);
      let timePointer = +new Date();

      for (let i = 0; i < 5; i++) {
        let schedule = cronInstance.schedule(timePointer);
        let next = schedule.next();
        nextSchedulesValue.push(next.format("YYYY-MM-DD HH:mm:ss"));
        timePointer = +next + 1000;
      }
    } catch (e) {}

    setNextSchedules(nextSchedulesValue);
  };

  const highlightParsed = selectedPartIndex => {
    var _parsedValue$descript;

    let parsedValue = parsed;

    if (!parsedValue) {
      return;
    }

    let toHighlight = [];
    let highlighted = "";

    for (let i = 0; i < 5; i++) {
      if (parsedValue && parsedValue.segments && parsedValue.segments[i] && parsedValue.segments[i].text) {
        toHighlight.push(_objectSpread({}, parsedValue.segments[i]));
      } else {
        toHighlight.push(null);
      }
    }

    if (selectedPartIndex >= 0) {
      if (toHighlight[selectedPartIndex]) {
        toHighlight[selectedPartIndex].active = true;
      }
    } // handle special case where minute/hour is presented in the same segment


    if (toHighlight[0] && toHighlight[1] && toHighlight[0].text && toHighlight[0].text === toHighlight[1].text && toHighlight[0].start === toHighlight[1].start) {
      if (toHighlight[1].active) {
        toHighlight[0] = null;
      } else {
        toHighlight[1] = null;
      }
    }

    toHighlight = toHighlight.filter(_ => _);
    toHighlight.sort((a, b) => {
      return a.start - b.start;
    });
    let pointer = 0;
    toHighlight.forEach(item => {
      if (pointer > item.start) {
        return;
      }

      highlighted += parsedValue.description.substring(pointer, item.start);
      pointer = item.start;
      highlighted += "<span".concat(item.active ? ' class="active"' : "", ">").concat(parsedValue.description.substring(pointer, pointer + item.text.length), "</span>");
      pointer += item.text.length;
    });
    highlighted += (_parsedValue$descript = parsedValue.description) === null || _parsedValue$descript === void 0 ? void 0 : _parsedValue$descript.substring(pointer);
    return highlighted;
  };

  const calculateExplanation = callback => {
    let isValidValue = true;
    let parsedValue;
    let highlightedExplanationValue;

    try {
      highlightedExplanationValue = "";
      parsedValue = _i18n.default.toString(props.value, {
        locale: props.locale
      });
      highlightedExplanationValue = parsedValue;
    } catch (e) {
      highlightedExplanationValue = e.toString();
      isValidValue = false; // console.log(highlightedExplanationValue)
    }

    Promise.all([setParsed(parsedValue), setIsValid(isValidValue), setHighlightedExplanation(highlightedExplanationValue)]).then(() => {
      if (isValid) {// setHighlightedExplanation(highlightParsed(-1));
      }

      if (callback) {
        callback();
      }
    });
  };

  const onCaretPositionChange = () => {
    if (!inputRef) {
      return;
    }

    let caretPosition = inputRef.selectionStart;
    let selected = props.value.substring(inputRef.selectionStart, inputRef.selectionEnd);

    if (selected.indexOf(" ") >= 0) {
      caretPosition = -1;
    }

    if (lastCaretPosition === caretPosition) {
      return;
    }

    lastCaretPosition = caretPosition;

    if (caretPosition === -1) {
      setHighlightedExplanation(highlightParsed(-1));
      setSelectedPartIndex(-1);
      return;
    }

    let textBeforeCaret = props.value.substring(0, caretPosition);
    let selectedPartIndexValue = textBeforeCaret.split(" ").length - 1;
    setSelectedPartIndex(selectedPartIndexValue);
  };

  const getLocale = () => {
    return _locales.default[props.locale];
  };

  (0, _react.useEffect)(() => {
    setTimeout(() => {
      calculateExplanation(() => {
        onCaretPositionChange();
        calculateNext();
      });
    });
  }, [props]);
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "crontab-input"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "explanation",
    dangerouslySetInnerHTML: {
      __html: isValid ? "\u201C".concat(highlightedExplanation, "\u201D") : "　"
    }
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "next"
  }, !!nextSchedules.length && /*#__PURE__*/_react.default.createElement("span", null, getLocale().nextTime, ": ", nextSchedules[0], " ", nextExpanded ? /*#__PURE__*/_react.default.createElement("a", {
    onClick: () => setNextExpanded(false)
  }, "(", getLocale().hide, ")") : /*#__PURE__*/_react.default.createElement("a", {
    onClick: () => setNextExpanded(true)
  }, "(", getLocale().showMore, ")"), !!nextExpanded && /*#__PURE__*/_react.default.createElement("div", {
    className: "next-items"
  }, nextSchedules.slice(1).map((item, index) => /*#__PURE__*/_react.default.createElement("div", {
    className: "next-item",
    key: index
  }, getLocale().then, ": ", item))))), /*#__PURE__*/_react.default.createElement("input", {
    type: "text",
    className: "cron-input " + (!isValid ? "error" : ""),
    value: props.value,
    ref: _ref => {
      inputRef = _ref;
    },
    onMouseUp: e => {
      onCaretPositionChange();
    } //  onKeyUp={e => {
    //    onCaretPositionChange()
    //  }}
    //  onBlur={e => {
    //    clearCaretPosition()
    //  }}
    ,
    onChange: e => {
      let parts = e.target.value.split(" ").filter(_ => _);

      if (parts.length !== 5) {
        props.onChange(e.target.value);
        setParsed({});
        setIsValid(false);
        return;
      }

      props.onChange(e.target.value);
    }
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "parts"
  }, [getLocale().minute, getLocale().hour, getLocale().dayMonth, getLocale().month, getLocale().dayWeek].map((unit, index) => /*#__PURE__*/_react.default.createElement("div", {
    key: index,
    className: "part " + (selectedPartIndex === index ? "selected" : "")
  }, unit))), _valueHints.default[props.locale][selectedPartIndex] && /*#__PURE__*/_react.default.createElement("div", {
    className: "allowed-values"
  }, _valueHints.default[props.locale][selectedPartIndex].map((value, index) => /*#__PURE__*/_react.default.createElement("div", {
    className: "value",
    key: index
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "key"
  }, value[0]), /*#__PURE__*/_react.default.createElement("div", {
    className: "value"
  }, value[1])))));
});

exports.CrontabInput = CrontabInput;
CrontabInput.propTypes = {
  locale: _propTypes.default.string,
  value: _propTypes.default.string,
  onChange: _propTypes.default.func
};
CrontabInput.defaultProps = {
  locale: "en"
};