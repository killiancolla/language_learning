"use client"

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowBigDown, ArrowBigRight, MicIcon, MoveRight, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [origin, setOrigin] = useState('fr-FR');
  const [target, setTarget] = useState('fr-FR');
  const [translatedText, setTranslatedText] = useState('');
  const [retranscription, setRetranscription] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [response, setResponse] = useState('')

  interface LanguageMap {
    [key: string]: string;
  }

  const languageMapping: LanguageMap = {
    "fr-FR": "French",
    "en-GB": "English",
    "ja-JP": "Japanese"
  };


  useEffect(() => {
    if (typeof window !== "undefined" && window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = origin;

      recognition.onresult = async (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setRetranscription(transcript);
      };

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = function (event) {
        if (event.error === 'network') {
          console.error('Erreur de reconnaissance vocale due à un problème réseau.');
          setTimeout(() => {
            if (isListening) {
              recognition.start();
            }
          }, 1000); // Attend une seconde avant de redémarrer
        }
      };
      setRecognition(recognition);
    } else {
      console.error("Speech recognition not supported in this browser.");
    }
  }, [origin, target]);

  const startListening = () => {
    recognition?.start();
  };

  const stopListening = async () => {
    recognition?.stop();
    await translateText(retranscription, target.slice(0, 2));
  };

  useEffect(() => {
    if (retranscription !== '')
      translateText(retranscription, target.slice(0, 2))
  }, [target])

  const translateText = async (text: String, targetLang: String) => {
    try {
      const response = await fetch(`http://localhost:3001/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: [text],
          target_lang: targetLang
        })
      });

      const data = await response.json();
      console.log("Response from DeepL API:", data);

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}, body: ${JSON.stringify(data)}`);
      }

      setTranslatedText(data.translations[0].text)
    } catch (error) {
      console.error("Error translating text:", error);
      return "";
    }
  }

  const handleSpeak = () => {
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(translatedText);
      utterance.lang = target;
      window.speechSynthesis.speak(utterance);
    } else {
      console.log("Speech synthesis not supported in this browser.");
    }
  };

  const handleExplain = async (text: string, targetLang: string) => {
    try {
      const response = await fetch(`http://localhost:3001/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          langue: languageMapping[targetLang],
          phrase: text
        })
      });

      const data = await response.json();
      console.log(data.message.content);
      setResponse(data.message.content)


      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}, body: ${JSON.stringify(data)}`);
      }

    } catch (error) {
      console.error("Error translating text:", error);
      return "";
    }
  }





  return (
    <>
      <div className="flex justify-center items-start w-2/3 h-screen mx-auto mt-10 gap-4">
        <div className="w-1/2 flex flex-col items-center gap-4">
          <Select onValueChange={setOrigin} defaultValue={origin}>
            <SelectTrigger>
              <SelectValue placeholder="Selectionnez la langue source" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.entries(languageMapping).map(([value, name]) => (
                  <SelectItem key={value} value={value}>{name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="relative w-full">
            <Textarea value={retranscription} onChange={(e) => setRetranscription(e.target.value)} placeholder="Entrez le texte à traduire" rows={4} />
            <Button variant={isListening ? "default" : "ghost"} size="icon" className="absolute top-3 right-3">
              <MicIcon onClick={!isListening ? startListening : stopListening} className={`w-5 h-5 ${isListening && 'animate-pulse'}`} />
            </Button>
          </div>
          <Button onClick={() => translateText(retranscription, target.slice(0, 2))} variant="default" className="w-full" /*className="z-10 absolute top-1/2 -translate-y-1/2 -right-2 translate-x-1/2 rounded-full"*/>
            Translate
          </Button>
        </div>
        <div className="w-1/2 flex flex-col items-center gap-4">
          <Select onValueChange={setTarget} defaultValue={target}>
            <SelectTrigger>
              <SelectValue placeholder="Selectionnez la langue source" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {Object.entries(languageMapping).map(([value, name]) => (
                  <SelectItem key={value} value={value}>{name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="relative w-full">
            <Textarea value={translatedText} rows={4} readOnly />
            <Button variant={isListening ? "default" : "ghost"} size="icon" className="absolute top-3 right-3">
              <Volume2 onClick={handleSpeak} />
            </Button>
          </div>
        </div>
      </div>
      <Button onClick={() => handleExplain(translatedText, origin)}>Oui encore moi</Button>
      <div className="p-4 bg-white shadow rounded-lg">
        <div dangerouslySetInnerHTML={{ __html: response.split('```').length > 1 ? response.split('```')[1].replace('html', '') : response }} />
      </div>
    </>
  )
}