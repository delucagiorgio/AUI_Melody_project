const _DEBUG = true;
const EVNT = {
    CXSTART: "CX_START",
    CXLEARNTUTORIAL: "CX_LEARN_TUTORIAL",
    CXTUTORIALOK: "CX_TUTORIAL_OK",
    CXTEMPO: "CX_TEMPO",
    CXFEELINGS: "CX_FEELINGS",
    CXLIKECHORDS: "CX_LIKE_CHORDS",
    CXTRYSING: "CX_TRY_SING",
    CXLIKEMELODY: "CX_LIKE_MELODY",
    CXPLAY: "CX_PLAY",
    CXRELISTENSONG: "CX_RELISTEN_SONG",
    CXADDMELODY: "CX_ADD_MELODY",
    CXNEWSONG: "CX_NEW_SONG",
    CXRESTART: "CX_RESTART",
    CXEND: "CX_END",
};

const convertBlobToBase64 = blob => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
});


const AudioSource = (state) => {
    let name = state.name;
    let path = state.path;
    let loop = (state.loop !== undefined) ? state.loop : false;
    let fadeIn = (state.fadeIn !== undefined) ? state.fadeIn : 0;

    let bufferSource = undefined;
    let buffer = new Promise((resolve, reject) => {
        try {
            if (_DEBUG) console.log( "[voice] loading " + name);
            // load player
            let buffer = new Tone.Buffer({
                url: path,
                reverse: false,
                onload: function () {
                    if (_DEBUG) console.log( "[voice] loaded " + name);
                    resolve(buffer)
                },
                onerror: function () {
                    reject(new DOMException("[voice] problem on input file"));
                }
            });
        } catch (e) {
            reject(new DOMException("[voice] problem on input file"));
        }
    });

    return {
        name,
        path,
        loop,
        bufferSource,
        buffer,
        // play audio buffer
        play(onended = Tone.noOp, onstarted = Tone.noOp) {
            buffer.then(function (buffer) {
                // convert Buffer to BufferSource and init
                bufferSource = new Tone.BufferSource({
                    buffer: buffer,
                    loop: loop,
                    fadeIn: fadeIn,
                    onload: function () {
                        if (_DEBUG) console.log("[voice] buffer " + name + " loaded");
                    }
                });
                // on end return callback
                bufferSource.onended = (self, e = onended) => {
                    // reinit buffersource https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
                    // An AudioBufferSourceNode can only be played once; after each call to start(), you have to create a new node if you want to play the same sound again. Fortunately, these nodes are very inexpensive to create
                    bufferSource = new Tone.BufferSource({
                        buffer: buffer,
                        loop: loop,
                        fadeIn: fadeIn,
                        onload: function () {
                            if (_DEBUG) console.log("[voice] buffer " + name + " reloaded");
                        }
                    });
                    if (_DEBUG) console.log("[voice] playback " + name + " ended");
                    // callback
                    e();
                };

                // connect to master and start
                if (name === EVNT.CXSTART + "_SONG") {
                    bufferSource.chain(new Tone.Volume(-30), Tone.Master);
                } else {
                    bufferSource.chain(new Tone.Volume(-1), Tone.Master);
                }
                bufferSource.start();
                onstarted();
                if (_DEBUG) console.log("[voice] playback " + name + " start");
            });
        },
        stop() {
            bufferSource.stop()
        }
    }
};
let FX = {
    CXSTARTSONG : AudioSource({
        name: EVNT.CXSTART + "_SONG",
        path: "/static/audio/boris/BORIS_MELODY_EXP.mp3",
        loop: true,
        fadeIn: 2}),
    CXTEMPOL : AudioSource({
        name: EVNT.CXTEMPO + "_LOW",
        path: "/static/audio/boris/CIAO.mp3"}),
    CXTEMPOH : AudioSource({
        name: EVNT.CXTEMPO + "_HIGH",
        path: "/static/audio/boris/CIAO.mp3"}),
    CXFEELUP : AudioSource({
        name: EVNT.CXFEELINGS + "_UP",
        path: "/static/audio/boris/FEEL_UP.mp3"}),
    CXFEELDOWN : AudioSource({
        name: EVNT.CXFEELINGS + "_DOWN",
        path: "/static/audio/boris/FEEL_DOWN.mp3"})
};
let VOICES = {
    CXSTART : AudioSource({
        name: EVNT.CXSTART,
        path:"/static/audio/boris/CIAO.mp3"}),
    CXLEARNTUTORIAL : AudioSource({
        name: EVNT.CXLEARNTUTORIAL,
        path:"/static/audio/boris/LEARN_TUTORIAL.wav"}),
    CXTUTORIALOK : AudioSource({
        name: EVNT.CXTUTORIALOK,
        path:"/static/audio/boris/COMPRESO_TUTORIAL.mp3"}),
    CXTEMPO : AudioSource({
        name: EVNT.CXTEMPO,
        path:"/static/audio/boris/CX_TEMPO_MAIN.mp3"}),
    CXTEMPONEXT : AudioSource({
        name: EVNT.CXTEMPO,
        path:"/static/audio/boris/CX_TEMPO_LOOP.mp3"}),
    CXFEELINGS : AudioSource({
        name: EVNT.CXFEELINGS,
        path:"/static/audio/boris/CX_FEELINGS_MAIN.mp3"}),
    CXFEELINGSNEXT : AudioSource({
        name: EVNT.CXFEELINGS,
        path:"/static/audio/boris/CX_FEELINGS_LOOP.mp3"}),
    CXLIKECHORDS : AudioSource({
        name: EVNT.CXLIKECHORDS,
        path:"/static/audio/boris/CX_LIKE_CHORDS_MAIN.mp3"}),
    CXLIKECHORDSNEXT : AudioSource({
        name: EVNT.CXLIKECHORDS,
        path:"/static/audio/boris/CX_LIKE_CHORDS_LOOP.mp3"}),
    CXPLAY : AudioSource({
        name: EVNT.CXPLAY,
        path:"/static/audio/boris/CX_PLAY.mp3"}),
    CXTRYSING : AudioSource({
        name: EVNT.CXTRYSING,
        path:"/static/audio/boris/CX_TRYSING.mp3"}),
    CXLIKEMELODY : AudioSource({
        name: EVNT.CXLIKEMELODY,
        path:"/static/audio/boris/CX_LIKE_MELODY_MAIN.mp3"}),
    CXRELISTENSONG : AudioSource({
        name: EVNT.CXRELISTENSONG,
        path:"/static/audio/boris/CX_RELISTEN_SONG.mp3"}),
    CXADDMELODY : AudioSource({
        name: EVNT.CXADDMELODY,
        path:"/static/audio/boris/CX_ADD_MELODY.mp3"}),
    CXNEWSONG : AudioSource({
        name: EVNT.CXNEWSONG,
        path:"/static/audio/boris/CX_NEW_SONG.mp3"}),
    CXEND : AudioSource({
        name: EVNT.CXEND,
        path:"/static/audio/boris/CX_END.mp3"}),
};

const BEvents = () => {
    // recordings
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioContext = new AudioContext();
    let audioInput = null;
    let realAudioInput = null;
    let inputPoint = null;
    let audioRecorder = null;
    let bufferSize = 2048;
    let mono = true;
    // listener
    let watchDogs = null;
    let speechEvents = null;
    // midi
    let tempo = 120;
    let tempoLength = 0;
    let blobMelody = null;
    let stpMelody = false;
    let stpChords = false;
    let stpMajor  = false;
    // context
    let lastContext = null;
    let playMusic = true;
    let currentContext = EVNT.CXSTART;
    let defaulFallback = "DEFAULT FALLBACK INTENT";
    let nextTempo = false;

    let userStream = new Promise((resolve, reject) => {
        try {
            if (!navigator.getUserMedia)
                navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            if (!navigator.cancelAnimationFrame)
                navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
            if (!navigator.requestAnimationFrame)
                navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

            navigator.getUserMedia(
                {
                    "audio": {
                        "mandatory": {
                            "googEchoCancellation": "false",
                            "googAutoGainControl": "false",
                            "googNoiseSuppression": "false",
                            "googHighpassFilter": "false"
                        },
                        "optional": []
                    },
                }, function (stream) {
                    resolve(stream);
                }, function(e) {
                    reject(new DOMException("[audio] error getting audio"));
                });
            if (_DEBUG) console.log("[audio] context initialized");
        } catch (e) {
            reject(new DOMException("[audio] error getting audio"));
        }
    });

    return {
        audioInput,
        audioContext,
        audioRecorder,
        bufferSize,
        inputPoint,
        realAudioInput,
        mono,
        tempo,
        stpMelody,
        stpChords,
        stpMajor,
        currentContext,
        lastContext,
        watchDogs,
        speechEvents,
        userStream,
        tempoLength,
        playMusic,
        defaulFallback,
        nextTempo,
        // listnWatchDogs(callback) {
        //     userStream.then(function (stream) {
        //         watchDogs = hark(stream, {
        //             interval : 50,
        //             threshold : -50
        //         });
        //         if (_DEBUG) console.log("[watchdogs] speech events armed");
        //         // event on speech
        //         watchDogs.on('speaking', function() {
        //             if (_DEBUG) console.log('[watchdogs] speaking');
        //         });
        //         // event on stop speech
        //         watchDogs.on('stopped_speaking', function() {
        //             if (_DEBUG) console.log('[watchdogs] stopped_speaking');
        //             return callback();
        //         });
        //     })
        // },
        listnHank(onstop, ajax = true) {
            let self = this;
            userStream.then(function (stream) {
                speechEvents = hark(stream, {
                    interval : 90,
                    threshold : -50
                });
                if (_DEBUG) console.log("[hark] speech events armed");
                // start recording input audio
                self.startStream();
                // remove focus on boris
                self.focusOnBoris(false);
                // event on speech
                speechEvents.on('speaking', function() {
                    if (_DEBUG) console.log('[hark] speaking');
                });
                // event on stop speech
                speechEvents.on('stopped_speaking', function() {
                    if (_DEBUG) console.log('[hark] stopped_speaking');
                    // stop recording
                    speechEvents.stop();
                    self.stopStream(self.currentContext, ajax, onstop);
                });

            })
        },
        startStream() {
            userStream.then(function (stream) {
                inputPoint = audioContext.createGain();
                // Create an AudioNode from the stream.
                realAudioInput = audioContext.createMediaStreamSource(stream);
                audioInput = realAudioInput;
                audioInput.connect(inputPoint);

                analyserNode = audioContext.createAnalyser();
                analyserNode.fftSize = bufferSize;
                inputPoint.connect(analyserNode);

                audioRecorder = new Recorder(inputPoint, {
                    bufferLen: bufferSize,
                    numChannels: 1,
                    mimeType: 'audio/wav'
                });

                audioRecorder.clear();
                audioRecorder.record();
            })
        },
        stopStream(inputContext, ajax = true, callback) {
            audioRecorder.stop();
            // export wav to blob
            audioRecorder.exportWAV(function (blob) {
                // export blob to base64
                convertBlobToBase64(blob).then(function(base64) {
                    // callback will receive nextcontext
                    if (ajax) {
                        if (_DEBUG) console.log("[dialogflow] request context:" + inputContext);
                        $.ajax({
                            url: '/get_response_step',
                            dataType: 'json',
                            type: 'post',
                            data: {
                                "input-context": inputContext,
                                "blob": base64
                            },
                            success: function(data) {
                                if (_DEBUG) console.log("[server] response success");
                                if (_DEBUG) console.log("[boris] next context > " + data.context);
                                // send to server the request with CONTEXT
                                callback(data.context.toUpperCase())
                            },
                            error: function(e) {
                                if (_DEBUG) {
                                    console.log("[server] error on response");
                                    console.log(e)
                                }
                            },
                        });
                    } else {
                        // callback will receive base64 of recordings
                        callback(base64);
                    }
                });
            });
        },
        scheduleEndPlay(context) {
            let usability;
            let lenPie = [0,0,0]; // melodyPartTemp[0], chordsPart[1], melodyPart[2]

            if (melodyChroma.length !== 0) {
                usability = melodyChroma._events[melodyChroma._events.length - 1];
                lenPie[0] = usability.value.time + usability.value.duration;
            }
            if (chordsPart.length !== 0) {
                usability = chordsPart._events[chordsPart._events.length - 1];
                lenPie[1] = usability.value.time + usability.value.duration;
            }
            if (melodyPart.length !== 0) {
                usability = melodyPart._events[melodyPart._events.length - 1];
                lenPie[2] = usability.value.time + usability.value.duration;
            }
            // Update song duration
            if (context === EVNT.CXLIKEMELODY) {
                tempoLength = lenPie[0];
            } else if (context === EVNT.CXLIKECHORDS) {
                tempoLength = lenPie[1];
            } else {
                tempoLength = Math.max(lenPie[1], lenPie[2]);
            }
            tempoLength = tempoLength + 2;
            //trigger the callback when the Transport reaches the desired time
            Tone.Transport.scheduleOnce(function(){
                if (_DEBUG)console.log("[tonejs:schedule] stop music after " + tempoLength);
                stopNote();
            }, tempoLength);
        },
        call(input) {
            if (_DEBUG) console.log("[event] Calling event ", input);
            // if (watchDogs === null) {
            //     this.listnWatchDogs(function () {
            //         if (_DEBUG) console.log("[watchdogs] watchdogs never sleep")
            //     });
            // }
            switch (input) {
                case EVNT.CXSTART:
                    this.lastContext = this.currentContext;
                    this.currentContext = EVNT.CXSTART;
                    this.cxStart();
                    break;
                case EVNT.CXLEARNTUTORIAL:
                    this.lastContext = this.currentContext;
                    this.currentContext = EVNT.CXLEARNTUTORIAL;
                    this.cxLearnTutorial() ;
                    break;
                case EVNT.CXTUTORIALOK:
                    this.lastContext = this.currentContext;
                    this.currentContext = EVNT.CXTUTORIALOK;
                    this.cxTutorialOk();
                    break;
                case EVNT.CXTEMPO:
                    this.lastContext = this.currentContext;
                    this.currentContext = EVNT.CXTEMPO;
                    this.cxTempo();
                    break;
                case EVNT.CXFEELINGS:
                    this.lastContext = this.currentContext;
                    this.currentContext = EVNT.CXFEELINGS;
                    this.cxFeelings();
                    break;
                case EVNT.CXLIKECHORDS:
                    this.lastContext = this.currentContext;
                    this.currentContext = EVNT.CXLIKECHORDS;
                    this.cxLikeChords();
                    break;
                case EVNT.CXTRYSING:
                    this.lastContext = this.currentContext;
                    this.currentContext = EVNT.CXTRYSING;
                    this.cxTrySing();
                    break;
                case EVNT.CXLIKEMELODY:
                    this.lastContext = this.currentContext;
                    this.currentContext = EVNT.CXLIKEMELODY;
                    this.cxLikeMelody();
                    break;
                case EVNT.CXRELISTENSONG:
                    this.lastContext = this.currentContext;
                    this.currentContext = EVNT.CXRELISTENSONG;
                    this.cxRelistenSong();
                    break;
                case EVNT.CXADDMELODY:
                    this.lastContext = this.currentContext;
                    this.currentContext = EVNT.CXADDMELODY;
                    this.cxAddMelody();
                    break;
                case EVNT.CXPLAY:
                    this.lastContext = this.currentContext;
                    this.currentContext = EVNT.CXPLAY;
                    this.cxPlay();
                    break;
                case EVNT.CXNEWSONG:
                    this.lastContext = this.currentContext;
                    this.currentContext = EVNT.CXNEWSONG;
                    this.cxNewSong();
                    break;
                case EVNT.CXRESTART:
                    this.lastContext = this.currentContext;
                    this.currentContext = EVNT.CXRESTART;
                    this.cxEnd();
                    break;
                case EVNT.CXEND:
                    this.lastContext = this.currentContext;
                    this.currentContext = EVNT.CXEND;
                    this.cxEnd();
                    break;
                default:
                    this.call(this.currentContext);
                    break;
            }
        },
        focusOnBoris(active = true) {
            let id = "#focus";
            if (active) {
                if (_DEBUG) console.log("[front] focus active on boris");
                $(id).addClass('active');
            } else {
                // remove focus on boris
                if (_DEBUG) console.log("[front] remove focus on boris");
                $(id).removeClass('active');
            }
        },
        activeCheck(start = 1) {
            let id = "#check";
            for (let i = 2; i < 9; i++) {
                if (i <= start) {
                    $(id+i).addClass('active')
                } else  {
                    $(id+i).removeClass('active')
                }
            }
        },
        activeFeelings(active = true) {
            let red = "#planet-red", blu = "#planet-blu";
            if (active) {
                if (_DEBUG) console.log("[front] active feelings planet");
                $(red).addClass('active');
                $(blu).addClass('active');
            } else {
                // remove focus on boris
                if (_DEBUG) console.log("[front] remove feelings planet");
                $(red).removeClass('active');
                $(blu).removeClass('active');
            }
        },
        writeOnText(text = 'Ops you miss the text!') {
            $("#text").html(text);
        },
        cxStart(){
            let self = this;
            // log event  description
            if (_DEBUG) console.log("[boris] start");
            // start background music
            FX.CXSTARTSONG.play();
            // activate checkpoint
            this.activeCheck(2);
            // wait for "Boris!" activating command
            setTimeout(function(){
                // Boris will say "Hello"
                VOICES.CXSTART.play(function () {
                        if (_DEBUG) console.log("[boris] next event to be launched");
                        self.call(EVNT.CXLEARNTUTORIAL)
                    }
                    , function () {
                        // write text on screen
                        setTimeout(function () {
                            self.writeOnText("Example");
                        },0)
                    })
            }, 12500);
        },
        cxLearnTutorial() {
            let self = this;
            // log event  description
            if (_DEBUG) console.log("[boris] start learn tutorial");
            // focus on boris
            this.focusOnBoris(true);
            // Boris will hask if you want to learn the tutorial
            VOICES.CXLEARNTUTORIAL.play(Tone.noOp , function () {
                setTimeout(function () {
                    // Boris will wait your answer
                    self.listnHank(function (nextEvent) {
                        // the response will call the next event
                        if (nextEvent === EVNT.CXTUTORIALOK) {
                            VOICES.CXLEARNTUTORIAL.stop();
                            // if user will call this event, move to cxTempo
                            return self.call(EVNT.CXTEMPO);
                        }
                    }, true);
                }, 5000);
                // write text on screen
                setTimeout(function () {
                    self.writeOnText("Example");
                },0)
            });
        },
        cxTutorialOk(){
            let self = this;
            // log event  description
            if (_DEBUG) console.log("[boris] start tutorial feedback");
            // Boris will hask if you learnt the tutorial
            VOICES.CXTUTORIALOK.play(function () {
                // Boris will wait your answer
                self.listnHank(function (nextEvent) {
                    // the response will call the next event
                    return self.call(nextEvent)
                }, true);
            }, function () {
                // write text on screen
                setTimeout(function () {
                    self.writeOnText("Facciamo una prova, possiamo continuare?");
                    setTimeout(function () {
                        self.writeOnText("sì - iniziamo con l’esperienza\n" +
                            "no - ripetimi il tutorial")
                    },8000)
                },0)
            });
        },
        cxTempo(){
            let self = this;
            let click = null;
            // log event  description
            if (_DEBUG) console.log("[boris] start tempo");
            // activate checkpoint
            this.activeCheck(3);
            // focus on boris
            this.focusOnBoris(true);
            // choose voices
            if (self.nextTempo) {
                voiceTempo = VOICES.CXTEMPONEXT;
            } else {
                voiceTempo = VOICES.CXTEMPO;
            }
            // Boris will hask if you like this tempo
            voiceTempo.play(function () {
                if (self.nextTempo) {
                    click = FX.CXTEMPOH;
                } else {
                    click = FX.CXTEMPOL;
                }
                if (self.playMusic) {
                    // play click
                    click.play(function () {
                        // Boris will wait your answer
                        self.listnHank(function (nextEvent) {
                            // if user says no, than change status
                            self.nextTempo = (nextEvent === "CX_TEMPO") ? !self.nextTempo : self.nextTempo;
                            // check if music should be played in default fallback
                            self.playMusic = nextEvent !== defaulFallback;
                            // the response will call the next event
                            return self.call(nextEvent)
                        }, true);
                    });
                } else {
                    // Boris will wait your answer
                    self.listnHank(function (nextEvent) {
                        // check if music should be played in default fallback
                        self.playMusic = nextEvent !== defaulFallback;
                        // the response will call the next event
                        return self.call(nextEvent)
                    }, true);
                }
            }, function () {
                if (self.nextTempo) {
                    // write text on screen
                    setTimeout(function () {
                        self.writeOnText("Preferisci questo?");
                        setTimeout(function () {
                            self.writeOnText("sì - conferma e vai avanti<br />" +
                                "no - ascolta il secondo")
                        }, 5000)
                    }, 0);
                } else {
                    // write text on screen
                    setTimeout(function () {
                        self.writeOnText("Prima di registrare il tuo pezzo da record devi scegliere il tempo che preferisci.");
                        setTimeout(function () {
                            self.writeOnText("Ascolta bene e scegli, ti piace questo?");
                            setTimeout(function () {
                                self.writeOnText("sì - conferma e vai avanti<br />" +
                                    "no - ascolta il secondo")
                            }, 5500)
                        }, 5000)
                    }, 0)
                }
            });
        },
        cxFeelings(){
            let self = this;
            // log event  description
            if (_DEBUG) console.log("[boris] start feelings");
            // activate checkpoint
            this.activeCheck(5);
            // focus on boris
            this.focusOnBoris(true);
            // active feelings planets
            self.activeFeelings(true);
            // if we are here melody is done
            stpMelody = true;
            // check stpMajor
            stpMajor = !stpMajor;
            // choose voices
            if (self.nextTempo) {
                voice = VOICES.CXFEELINGSNEXT;
            } else {
                voice = VOICES.CXFEELINGS;
            }
            // Boris will hask if you like this feelings
            voice.play(function () {
                if (self.nextTempo) {
                    feel = FX.CXFEELDOWN;
                } else {
                    feel = FX.CXFEELUP;
                }
                if (self.playMusic) {
                    feel.play(function () {
                        // set text
                        self.writeOnText("sì - conferma e vai avanti<br />no - ascolta il secondo");
                        // Boris will wait your answer
                        self.listnHank(function (nextEvent) {
                            // if user says no, than change status
                            self.nextTempo = (nextEvent === "CX_FEELINGS") ? !self.nextTempo : self.nextTempo;
                            // check if music should be played in default fallback
                            self.playMusic = nextEvent !== defaulFallback;
                            // the response will call the next event
                            return self.call(nextEvent)
                        }, true);
                    });
                } else {
                    // set text
                    self.writeOnText("sì - conferma e vai avanti<br />no - ascolta il secondo");
                    // Boris will wait your answer
                    self.listnHank(function (nextEvent) {
                        // check if music should be played in default fallback
                        self.playMusic = nextEvent !== defaulFallback;
                        // the response will call the next event
                        return self.call(nextEvent)
                    }, true);
                }
            }, function () {
                if (self.nextTempo) {
                    // write text on screen
                    setTimeout(function () {
                        self.writeOnText("Preferisci questo?");
                    }, 0);
                } else {
                    // write text on screen
                    setTimeout(function () {
                        self.writeOnText("È arrivato il momento di scegliere la destinazione, ascolta e scegli dove vuoi arrivare");
                        setTimeout(function () {
                            self.writeOnText("Vuoi arrivare qui?")
                        }, 6500)
                    }, 0)
                }
            });
        },
        cxPlay(){
            let self = this;
            // log event  description
            if (_DEBUG) console.log("[boris] start playing music");
            // activate checkpoint
            this.activeCheck(7);
            // if we are here chords are done
            stpChords = true;
            // commit temp part into final
            if (lastContext !== EVNT.CXRELISTENSONG) {
                clearMelodyChroma();
                getMelody(blobMelody, function () {
                    addMelody();
                });
            }
            // schedule the stop
            self.scheduleEndPlay(self.currentContext);
            // Boris will congrats with you
            VOICES.CXPLAY.play(function () {
                // Boris will play your song
                playNote(true, true, false);
                // Once is finished
                Tone.Transport.once('stop', function () {
                    if (_DEBUG) console.log("[music] song stopped");
                    // Boris will ask if user want to relisten
                    return self.call(EVNT.CXRELISTENSONG);
                });
            }, function () {
                // write text on screen
                setTimeout(function () {
                    self.writeOnText("Bene ora che ho la melodia posso trasformarla per farla suonare con gli accordi che hai scelto.");
                    setTimeout(function () {
                        self.writeOnText("Aspetta la trasformazione..");
                        setTimeout(function () {
                            self.writeOnText("Ok ci sono. Possiamo ascoltarla insieme");
                        },3000)
                    },7000)
                },0)
            });
        },
        cxLikeChords(){
            let self = this;
            // log event  description
            if (_DEBUG) console.log("[boris] start chord feedback");
            // generate new chords respect the answer
            getChords(stpMajor);
            // remove feelings planet
            self.activeFeelings(false);
            // activate checkpoint
            this.activeCheck(6);
            // focus on boris
            this.focusOnBoris(true);
            // Boris will hask if you like this chords
            VOICES.CXLIKECHORDS.play(function () {
                if (self.playMusic) {
                    // schedule the stop
                    self.scheduleEndPlay(self.currentContext);
                    // Boris will play the chords
                    playNote(false, true, false);
                } else {
                    Tone.Transport.stop();
                }
                // Once chords are played
                Tone.Transport.once('stop', function () {
                    if (_DEBUG) console.log("[music] song stopped");
                    // set text
                    self.writeOnText("sì - conferma e vai avanti<br />no - ascolta il prossimo")
                    // Boris will ask if your like these chords
                    self.listnHank(function (nextEvent) {
                        // check if music should be played in default fallback
                        self.playMusic = nextEvent !== defaulFallback;
                        // the response will call the next event
                        return self.call(nextEvent)
                    }, true);
                })

            }, function () {
                // write text on screen
                setTimeout(function () {
                    self.writeOnText("Una canzone senza accordi non è nulla, scegli l’accordo che ti piace di più per personalizzare la tua melodia!");
                    setTimeout(function () {
                        self.writeOnText("Vuoi scegliere questo accordo?")
                    },8000)
                },0)
            });
        },
        cxTrySing(){
            let self = this;
            // reset nextTempo
            this.nextTempo = false;
            // log event  description
            if (_DEBUG) console.log("[boris] start sing");
            // activate checkpoint
            this.activeCheck(4);
            // focus on boris
            this.focusOnBoris(true);
            // Boris will hask to sing
            VOICES.CXTRYSING.play(function () {
                // set text
                self.writeOnText("");
                // Boris will wait your answer
                self.listnHank(function (base64) {
                    // save blob sing
                    blobMelody = base64;
                    // generate the melody
                    getChroma(base64, function () {
                        // the response will call the next event
                        return self.call(EVNT.CXLIKEMELODY)
                    });
                }, false);
            }, function () {
                // write text on screen
                setTimeout(function () {
                    self.writeOnText("Perfetto ora possiamo iniziare!");
                    setTimeout(function () {
                        self.writeOnText("Indovina… È arrivato il tuo turno! Ora non preoccuparti della bellezza o della lunghezza del motivetto che vuoi cantare, se non ti piace avrai comunque modo di rifarlo!");
                        setTimeout(function () {
                            self.writeOnText("Pronto? Bene, attendi l’accensione della spia per iniziare a cantare!");
                        },13500)
                    },3700)
                },0)
            })
        },
        cxLikeMelody(){
            let self = this;
            // log event  description
            if (_DEBUG) console.log("[boris] start melody feedback");
            // focus on boris
            this.focusOnBoris(true);
            // boris will speech
            VOICES.CXLIKEMELODY.play(function () {
                if (self.playMusic) {
                    // schedule the stop
                    self.scheduleEndPlay(self.currentContext);
                    // Boris will play the melody
                    playNote(false, false,true);
                } else {
                    Tone.Transport.stop();
                }
                // Once melody is finished
                Tone.Transport.once('stop', function () {
                    if (_DEBUG) console.log("[music] song stopped");
                    // print text
                    self.writeOnText("sì - vai al prossimo passaggio<br />no - registra di nuovo");
                    // Boris will ask if your like this melody
                    self.listnHank(function (nextEvent) {
                        // if chords are already done play song
                        if (nextEvent === EVNT.CXFEELINGS && stpChords) {
                            return self.call(EVNT.CXPLAY)
                        } else {
                            // check if music should be played in default fallback
                            self.playMusic = nextEvent !== defaulFallback;
                            // the response will call the next event
                            return self.call(nextEvent)
                        }
                    }, true);
                });
            }, function () {
                // write text on screen
                self.writeOnText("Quella che stai sentendo ora è la prima rielaborazione della tua voce, ti piace?");
            });
        },
        cxRelistenSong(){
            let self = this;
            // log event  description
            if (_DEBUG) console.log("[boris] start relisten");
            // focus on boris
            this.focusOnBoris(true);
            VOICES.CXRELISTENSONG.play(function () {
                // set text
                self.writeOnText("sì - riascolta<br />no - procedi");
                // Boris will ask if you want to listen again the song
                self.listnHank(function (nextEvent) {
                    // the response will call the next event
                    return self.call(nextEvent)
                }, true);
            }, function () {
                // write text on screen
                self.writeOnText("Bella vero? Vuoi riascoltarla?");
            });
        },
        cxAddMelody(){
            let self = this;
            // log event  description
            if (_DEBUG) console.log("[boris] start add melody");
            // activate checkpoint
            this.activeCheck(8);
            // focus on boris
            this.focusOnBoris(true);
            VOICES.CXADDMELODY.play(function () {
                // set text
                self.writeOnText("sì - registra la parte nuova<br />no - concludi");
                // Boris will ask if you want to add a new melody
                self.listnHank(function (nextEvent) {
                    // the response will call the next event
                    return self.call(nextEvent)
                }, true);
            }, function () {
                // write text on screen
                self.writeOnText("Ottimo, siamo arrivati quasi alla fine! vuoi aggiungere un’altra parte al tuo componimento?");
            });
        },
        cxNewSong(){
            let self = this;
            // log event  description
            if (_DEBUG) console.log("[boris] start new song");
            // focus on boris
            this.focusOnBoris(true);
            VOICES.CXNEWSONG.play(function () {
                // set text
                self.writeOnText("sì - registriamo di nuovo<br />no - concludi");
                // Boris will ask if you want to create a new song
                self.listnHank(function (nextEvent) {
                    // the response will call the next event
                    return self.call(nextEvent)
                }, true);
            }, function () {
                // write text on screen
                self.writeOnText("Speriamo ti sia divertito e se sei abbastanza ispirato puoi registrare anche qualcosa di nuovo!  Vuoi iniziare una nuova canzone?");
            });
        },
        cxRestart(){
            let self = this;
            // log event  description
            if (_DEBUG) console.log("[boris] restart");
            // Boris will restart
            return self.call(EVNT.CXTEMPO);
        },
        cxEnd(){
            let self = this;
            // log event  description
            if (_DEBUG) console.log("[boris] start end");
            // focus on boris
            this.focusOnBoris(true);
            VOICES.CXEND.play(function () {
                // Boris will go away
            }, function () {
                // write text on screen
                self.writeOnText("Adesso siamo proprio arrivati alla fine, per Boris sei ufficialmente una Rockstar!");
                setTimeout(function () {
                    self.writeOnText("A presto!");
                }, 8500);
            });
        }
    }
};
