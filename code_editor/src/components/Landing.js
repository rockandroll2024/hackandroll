import React, { useEffect, useState, useCallback } from "react";
import CodeEditorWindow from "./CodeEditorWindow";
import axios from "axios";
import { classnames } from "../utils/general";
import { languageOptions } from "../constants/languageOptions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { defineTheme } from "../lib/defineTheme";
import useKeyPress from "../hooks/useKeyPress";
import OutputWindow from "./OutputWindow";
import ThemeDropdown from "./ThemeDropdown";
import LanguagesDropdown from "./LanguagesDropdown";
import CustomWebcam from "./CustomWebcam";

const javascriptDefault = `//Welcome to Code Editor!`;

const Landing = () => {

  const [code, setCode] = useState(javascriptDefault);
  const [customInput, setCustomInput] = useState("");
  const [outputDetails, setOutputDetails] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [running, setRunning] = useState(null);
  const [theme, setTheme] = useState("cobalt");
  const [language, setLanguage] = useState(languageOptions[0]);

  const enterPress = useKeyPress("Enter");
  const ctrlPress = useKeyPress("Control");

  const onSelectChange = (sl) => {
    console.log("selected Option...", sl);
    setLanguage(sl);
  };

  const showSuccessToast = useCallback((msg) => {
    toast.success(msg || `Compiled Successfully!`, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }, []); // No dependencies, so an empty array

  const showErrorToast = useCallback((msg, timer) => {
    toast.error(msg || `Something went wrong! Please try again.`, {
      position: "top-right",
      autoClose: timer ? timer : 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }, []); // No dependencies, so an empty array


  const checkStatus = useCallback(async (token) => {
    const options = {
      method: 'GET',
      url: `${process.env.REACT_APP_RAPID_API_URL}/${token}`,
      params: { base64_encoded: 'true', fields: '*' },
      headers: {
        'X-RapidAPI-Host': process.env.REACT_APP_RAPID_API_HOST,
        'X-RapidAPI-Key': process.env.REACT_APP_RAPID_API_KEY,
      },
    };

    try {
      let response = await axios.request(options);
      let statusId = response.data.status?.id;

      if (statusId === 1 || statusId === 2) {
        // still processing
        setTimeout(() => {
          checkStatus(token);
        }, 2000);
        return;
      } else {
        setProcessing(false);
        setOutputDetails(response.data);
        showSuccessToast(`Compiled Successfully!`);
        console.log("response.data", response.data);
        return;
      }
    } catch (err) {
      console.log("Error in checkStatus: ", err);
      setProcessing(false);
      showErrorToast();
    }
  }, [setProcessing, setOutputDetails, showSuccessToast, showErrorToast]);

  const handleCompile = useCallback(() => {
    console.log("handleCompile called...");
    setProcessing(true);
    const formData = {
      language_id: language.id,
      source_code: btoa(code),
      stdin: btoa(customInput),
    };
    const options = {
      method: "POST",
      url: process.env.REACT_APP_RAPID_API_URL,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
        "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
      },
      data: formData,
    };

    axios.request(options)
      .then(function (response) {
        const token = response.data.token;
        checkStatus(token); // Ensure checkStatus is stable or included in dependencies
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err;
        let status = err.response ? err.response.status : null;
        console.log("Error status", status);
        if (status === 429) {
          showErrorToast(`Quota of 100 requests exceeded for the Day!`, 10000);
        }
        setProcessing(false);
        console.log("Error in handleCompile: ", error);
      });
  }, [code, customInput, language, setProcessing, checkStatus, showErrorToast]);

  const handleStartEnd = () => {
    setRunning(!running);
  };

  useEffect(() => {
    if (enterPress && ctrlPress) {
      console.log("enterPress", enterPress);
      console.log("ctrlPress", ctrlPress);
      handleCompile();
    }
  }, [ctrlPress, enterPress, handleCompile]);
  const onChange = (action, data) => {
    switch (action) {
      case "code": {
        setCode(data);
        break;
      }
      default: {
        console.warn("case not handled!", action, data);
      }
    }
  };

  function handleThemeChange(th) {
    const theme = th;
    console.log("theme...", theme);

    if (["light", "vs-dark"].includes(theme.value)) {
      setTheme(theme);
    } else {
      defineTheme(theme.value).then((_) => setTheme(theme));
    }
  }
  useEffect(() => {
    defineTheme("oceanic-next").then((_) =>
      setTheme({ value: "oceanic-next", label: "Oceanic Next" })
    );
  }, []);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="h-4 w-full"></div>
      <div className="flex flex-row space-x-4 items-start px-4 py-4">
        <div className="left-container flex flex-shrink-0 w-1/3 flex-col h-screen">
        <div className="h-1/2 mr-5 mb-2">
        </div>
          <div className="h-1/2 mr-5 mb-2">
            <CustomWebcam />
          </div>
        </div>
        <div className="right-container flex flex-col w-2/3 h-screen">
          <div className="flex flex-row w-full justify-end items-end px-4 py-2 mb-4 space-x-4">
          <button
              onClick={handleStartEnd}
              className={classnames(
                "border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-8 py-2.5 hover:shadow transition duration-200 bg-white flex-shrink-0 mr-auto",
                {
                  "opacity-50" : !code,
                  'bg-green-500 hover:bg-green-600': !running,
                  'bg-red-500 hover:bg-red-600': running,
                }
              )}
            >
              {running ? "Stop" : "Start"}
            </button>
            <LanguagesDropdown onSelectChange={onSelectChange} />
            <ThemeDropdown handleThemeChange={handleThemeChange} theme={theme} />
            <button
              onClick={handleCompile}
              disabled={!code}
              className={classnames(
                "border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2.5 hover:shadow transition duration-200 bg-white flex-shrink-0",
                !code ? "opacity-50" : ""
              )}
            >
              {processing ? "Processing..." : "Compile and Execute"}
            </button>
          </div>
          <div className="h-1/2 mr-5 mb-2">
            <CodeEditorWindow
              code={code}
              onChange={onChange}
              language={language?.value}
              theme={theme.value}
            />
          </div>
          <div className="flex flex-row w-full justify-start items-start px-4">
            <h1 className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 mb-2">
              Output
            </h1>
          </div>
          <div className="h-1/2 mr-5 mb-2">
            <div className="w-full"><OutputWindow outputDetails={outputDetails} /></div>
            {/* <div className="w-1/3">{outputDetails && <OutputDetails outputDetails={outputDetails} />}</div> */}
          </div>
        </div>
      </div>
    </>
  );
};
export default Landing;
