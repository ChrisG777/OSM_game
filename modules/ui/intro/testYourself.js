import { dispatch as d3_dispatch } from 'd3-dispatch';

import { t } from '../../core/localizer';
import { modeBrowse } from '../../modes/browse';
import { utilArrayUniq, utilRebind } from '../../util';
import { helpHtml, pad, transitionTime, isMostlySquare, similarityScore, roadScore } from './helper';
import confetti from 'canvas-confetti';

export function uiIntroTestYourself(context, reveal) {
    var dispatch = d3_dispatch('done');
    var timeouts = [];
    var houseOne = [-108.76815050621282, 44.757092123438795];
    var roadOne = [-120.28498918301646, 37.82375500900029];
    var lakeOne = [-96.0674992753161, 46.44227574300414];
    var lives = 5;


    var chapter = {
        title: 'intro.testyourself.title'
    };


    function timeout(f, t) {
        timeouts.push(window.setTimeout(f, t));
    }


    // Reveal a house on the map based on the center, text, and options, with padding calculated based on the zoom level
    function revealHouse(center, text, options) {
        var padding = 350 * Math.pow(2, context.map().zoom() - 20);
        var box = pad(center, padding, context);
        reveal(box, text, options);
    }

    // Reveal all houses on the map based on the center, text, and options, with a bounding box extending to the left edge of the viewport
    function revealAllHouse(center, text, options) {
        var rect = context.surfaceRect();
        var box = pad([center[0]+0.0001, center[1]], rect.left+80, context);
        reveal(box, text, options);
    }

    function revealRoad(center, text, options) {
        var padding = 800 * Math.pow(2, context.map().zoom() - 17);
        var box = pad(center, padding, context);
        reveal(box, text, options);
    }

    function revealAllRoad(center, text, options) {
        var rect = context.surfaceRect();
        var box = pad([center[0]+0.001, center[1]], rect.left+80, context);
        reveal(box, text, options);
    }

    function revealLake(center, text, options) {
        var padding = 250 * Math.pow(2, context.map().zoom() - 16);
        var box = pad(center, padding, context);
        reveal(box, text, options);
    }

    function revealAllLake(center, text, options) {
        var rect = context.surfaceRect();
        var box = pad([center[0]+0.001, center[1]], rect.left+100, context);
        reveal(box, text, options);
    }

    // Restarts the assessment after notifying user that they are out of lives
    function noLivesRemaining() {
        var onClick = function() { continueTo(introTest); };

        revealAllHouse(houseOne, helpHtml('intro.testyourself.no_lives_remaining'),
            { buttonText: t.html('intro.testyourself.retry'), buttonCallback: onClick, tooltipBox: '.intro-nav-wrap .chapter-testYourself' }
        );

        function continueTo(nextStep) {
            context.map().on('move.intro drawn.intro', null);
            nextStep();
        }
    }

    // Starts user off on a blank slate (browse mode, no features), and reveals a help message on the map with an "OK" button that when clicked continues to the stepOneInstructions step.
    function introTest() {
        context.enter(modeBrowse(context));
        context.history().reset('initial');

        var onClick = function() { continueTo(stepOneInstructions); };

        reveal('.intro-nav-wrap .chapter-testYourself', helpHtml('intro.testyourself.intro'),
            { buttonText: t.html('intro.ok'), buttonCallback: onClick }
        );

        function continueTo(nextStep) {
            context.map().on('drawn.intro', null);
            nextStep();
        }
    }


    // stepOneInstructions function
    // This function displays instructions for step one of the assessment
    // It calculates the transition time and duration for centering and zooming the map on the first house
    // It centers and zooms the map on the first house
    // After a short delay, it reveals a message with a "Start" button on the first house
    // When the "Start" button is clicked, it transitions to the stepOne function
    function stepOneInstructions() {
        var msec = transitionTime(houseOne, context.map().center());
        if (msec) {
        reveal(null, null, { duration: 0 });
        }
        context.map().centerZoomEase(houseOne, 19, msec);
        var onClick = function() {
        continueTo(stepOne);
        };
        timeout(function() {
        revealHouse(houseOne, helpHtml('intro.testyourself.stepOne'), {
            buttonText: t.html('intro.testyourself.start'),
            buttonCallback: onClick
        });
        }, msec + 100);
        function continueTo(nextStep) {
        context.map().on('move.intro drawn.intro', null);
        nextStep();
        }
    }

    // stepOne function
    // This function displays the first step of the assessment
    // It reveals a message on the first house with a "Click Done" button
    // It listens for the user selecting a way (area) on the map
    // When the "Click Done" button is clicked, it evaluates the user's selection
    // If the user's selection is correct, it transitions to the stepTwoInstructions function
    // If the user's selection is incorrect, it transitions to the retryStepOne function
    function stepOne() {
        let way = null;
        var onClick = function() { evaluateStepOne(way); };
        revealAllHouse(houseOne, helpHtml('intro.testyourself.lives_remaining')+"<br/>"+helpHtml('intro.testyourself.hearts'+lives),
            { buttonText: t.html('intro.testyourself.click_done'), buttonCallback: onClick, tooltipBox: '.intro-nav-wrap .chapter-testYourself' }
        );

        context.on('enter.intro', function(mode) {
            if (mode.id === 'select') {
                way = context.entity(context.selectedIDs()[0]);
            }
        });

        function evaluateStepOne(way) {
            if (way === null) {
                return continueTo(retryStepOne);
            }
            var graph = context.graph();
            var nodes = graph.childNodes(way);

            var loc_points = utilArrayUniq(nodes)
                .map(function(n) { return n.loc; });

            var points = utilArrayUniq(nodes)
                .map(function(n) { return context.projection(n.loc); });

            // console.log(loc_points);
            var answers = [
                [-108.76839480774868, 44.757277204079415],
                [-108.76818096655359, 44.75727709782705],
                [-108.76818119671758, 44.75705426890007],
                [-108.76799626532393, 44.75705416539446],
                [-108.76799600584256, 44.75727191445505],
                [-108.76776877746883, 44.75727177097341],
                [-108.76776927329404, 44.756890931379615],
                [-108.76839020879721, 44.75689134046913],
                [-108.76839016069364, 44.75693250699196],
                [-108.76852263621537, 44.756932575702685],
                [-108.76852250928611, 44.75706198565325],
                [-108.76839501357826, 44.75706192407335],
               ]
            answers = answers.map(function (n) { return context.projection(n)});
            console.log(similarityScore(points, answers));
            //console.log(doPolygonsIntersect(points, answers))

            if (isMostlySquare(points) && similarityScore(points, answers) > 0.94) {
                return continueTo(stepTwoInstructions);
            } else {
                return continueTo(retryStepOne);
            }
        }

        function continueTo(nextStep) {
            context.map().on('move.intro drawn.intro', null);
            nextStep();
        }
    }

    // retryStepOne function
    // This function is called when the user's selection in stepOne is incorrect
    // It decrements the user's remaining lives
    // If the user has no lives remaining, it transitions to the noLivesRemaining function
    // Otherwise, it resets the map view and reveals a message on the first house with a "OK" button
    // When the "OK" button is clicked, it transitions back to the stepOne function
    function retryStepOne() {
        lives -= 1;
        if (lives === 0) {
        lives = 5;
        return continueTo(noLivesRemaining);
        }
        context.enter(modeBrowse(context));
        context.history().reset('initial');
        var onClick = function() {
        continueTo(stepOne);
        };
        revealHouse(houseOne, helpHtml('intro.testyourself.retry_step_one'), {
        buttonText: t.html('intro.ok'),
        buttonCallback: onClick
        });
        context.map().on('move.intro drawn.intro', function() {
        revealHouse(houseOne, helpHtml('intro.testyourself.retry_step_one'), {
            duration: 0,
            buttonText: t.html('intro.ok'),
            buttonCallback: onClick
        });
        });

        function continueTo(nextStep) {
        context.map().on('move.intro drawn.intro', null);
        nextStep();
        }
    }

    // stepTwoInstructions function
    // This function displays instructions for step two of the assessment
    // It calculates the transition time and duration for centering and zooming the map on the first road
    // It centers and zooms the map on the first road
    // After a short delay, it reveals a message with a "Start" button on the first road
    // When the "Start" button is clicked, it transitions to the stepTwo function
    function stepTwoInstructions() {
        var msec = transitionTime(roadOne, context.map().center());
        if (msec) { reveal( null, null, { duration: 0 }); }
        context.map().centerZoomEase(roadOne, 16, msec);

        var onClick = function() { continueTo(stepTwo); };

        timeout(function() {
            revealRoad(roadOne, helpHtml('intro.testyourself.stepTwo'),
                { buttonText: t.html('intro.testyourself.start'), buttonCallback: onClick }
            );
        }, msec + 100);

        function continueTo(nextStep) {
            context.map().on('move.intro drawn.intro', null);
            nextStep();
        }
    }

    // stepTwo function
    // This function displays the second step of the assessment
    // It reveals a message on the first road with a "Click Done" button
    // It listens for the user selecting a way (road) on the map
    // When the "Click Done" button is clicked, it evaluates the user's selection
    // If the user's selection matches the expected road, it transitions to the stepThreeInstructions function
    // If the user's selection does not match the expected road, it transitions to the retryStepTwo function
    function stepTwo() {
        let way = null;
        var onClick = function() { evaluateStepTwo(way); };
        revealAllRoad(roadOne, helpHtml('intro.testyourself.lives_remaining')+"<br/>"+helpHtml('intro.testyourself.hearts'+lives),
            { buttonText: t.html('intro.testyourself.click_done'), buttonCallback: onClick, tooltipBox: '.intro-nav-wrap .chapter-testYourself' }
        );

        context.on('enter.intro', function(mode) {
            if (mode.id === 'select') {
                way = context.entity(context.selectedIDs()[0]);
            }
        });

        function evaluateStepTwo(way) {
            if (way === null) {
                return continueTo(retryStepTwo);
            }
            var graph = context.graph();
            var nodes = graph.childNodes(way);
            console.log(nodes);
            var loc_points = utilArrayUniq(nodes)
                .map(function(n) { return n.loc; });

            var points = utilArrayUniq(nodes)
                .map(function(n) { return context.projection(n.loc); });

            console.log(loc_points);
            var answers = [
                [-120.29420525319166, 37.81922937162883],
                [-120.29395848996226, 37.81937345050321],
                [-120.29378682858531, 37.81956838029738],
                [-120.29379755742137, 37.81982263577705],
                [-120.29388338810988, 37.82006841524152],
                [-120.29390484578197, 37.82028029343337],
                [-120.2937117267329, 37.82054302154658],
                [-120.29356152302809, 37.82072947318862],
                [-120.29338986165111, 37.820805748724595],
                [-120.29311091191356, 37.820805748724595],
                [-120.29283196217601, 37.82087354913486],
                [-120.29255301243847, 37.821009149768564],
                [-120.29227406270093, 37.8211871252222],
                [-120.29203802830762, 37.82133120027513],
                [-120.29173762089793, 37.82126340028527],
                [-120.29150158650462, 37.821136275136375],
                [-120.29126555211133, 37.82099219970298],
                [-120.29126555211133, 37.82072099812417],
                [-120.291211907931, 37.820492171017],
                [-120.29120117909495, 37.820246392963526],
                [-120.29136211163586, 37.82002603953016],
                [-120.29139429814404, 37.819797210268476],
                [-120.29122263676707, 37.819602281078616],
                [-120.29087931401317, 37.819526004298964],
                [-120.29049307591502, 37.81948362827622],
                [-120.29017121083324, 37.81946667786031],
                [-120.2898386169154, 37.819526004298964],
                [-120.28973132855478, 37.81970398332887],
                [-120.2897849727351, 37.819924337723656],
                [-120.2898386169154, 37.82011079092855],
                [-120.28965622670239, 37.82031419388762],
                [-120.2894952941615, 37.82047522083269],
                [-120.28932363278452, 37.82067862278749],
                [-120.28917342907971, 37.820848123988306],
                [-120.28896958119458, 37.82105152491548],
                [-120.28869063145703, 37.82111932509997],
                [-120.28841168171948, 37.82111085008034],
                [-120.28817564732617, 37.821229500266966],
                [-120.28795034176892, 37.821458325088265],
                [-120.28775722271982, 37.8215515498121],
                [-120.28752118832654, 37.82144985010753],
                [-120.28721005208081, 37.821339675269485],
                [-120.28692037350719, 37.82126340028527],
                [-120.28663069493359, 37.82117865021033],
                [-120.28631955868785, 37.82124645027805],
                [-120.28610498196664, 37.82135662525528],
                [-120.28585821873729, 37.82144137512583],
                [-120.28555781132764, 37.82156849974922],
                [-120.2852466750819, 37.82175494880079],
                [-120.28499991185254, 37.82178037363495],
                [-120.2846887756068, 37.82167867424569],
                [-120.28448492772166, 37.8215261248991],
                [-120.2842381644923, 37.821390525215186],
                [-120.28398067242689, 37.82124645027805],
                [-120.28363734967296, 37.82117017519748],
                [-120.2832296539027, 37.821229500266966],
                [-120.28291851765697, 37.821348150262864],
                [-120.28272539860791, 37.8215261248991],
                [-120.28278977162425, 37.821737998906464],
                [-120.28303653485362, 37.82191597260263],
                [-120.28330475575513, 37.82209394586965],
                [-120.2834978748042, 37.822280393593864],
                [-120.2834978748042, 37.82252616487431],
                [-120.283465688296, 37.822754985675566],
                [-120.28342277295177, 37.82303465458037],
                [-120.28353006131239, 37.8233058476578],
                [-120.28350860364024, 37.82355161552347],
                [-120.28365880734508, 37.82373805956529],
                [-120.2839699435908, 37.82391602843853],
                [-120.28422743565625, 37.824068572845476],
                [-120.28448492772166, 37.824229591599625],
                [-120.28471023327891, 37.82439061000244],
                [-120.28474241978711, 37.82457705192471],
                [-120.28465658909863, 37.82475501877477],
                [-120.28438836819713, 37.82479739177106],
                [-120.28415233380382, 37.824695696539116],
                [-120.28386265523022, 37.82457705192471],
                [-120.283465688296, 37.82449230565481],
                [-120.28314382321422, 37.82441603392867],
                [-120.28285414464062, 37.82428043955425],
                [-120.2826502967555, 37.824170268941614],
                [-120.28252155072279, 37.82398382599167],
                [-120.28241426236217, 37.82375500900028],
                [-120.28229624516553, 37.82350924181192],
                [-120.2820387531001, 37.82339059529013],
                [-120.28171688801831, 37.82333974672242],
                [-120.28136283642834, 37.82328042334913],
                [-120.28104097134656, 37.823238049481866],
                [-120.28069764859264, 37.82317872602683],
                [-120.28039724118298, 37.823110927734135],
                [-120.28001100308482, 37.82303465458037],
                [-120.27975351101941, 37.82314482688827],
                [-120.27968913800304, 37.823407544804944],
                [-120.27982861287182, 37.82367873651217],
                [-120.27982861287182, 37.82402619943073],
                [-120.27965695149484, 37.82430586351845],
                [-120.2794638324458, 37.82456010267854],
                [-120.27928144223277, 37.824763493376004],
                [-120.27900249249522, 37.82488213769064],
                [-120.27876645810191, 37.82472959496533],
                [-120.27865916974133, 37.824500780286186],
                [-120.27857333905285, 37.82425501558133],
                [-120.27841240651198, 37.82406009816447],
                [-120.27809054143019, 37.82389907904054],
                [-120.27769357449597, 37.8238058572819],
                [-120.27732879406994, 37.823814331992104],
                [-120.27709275967663, 37.82372958484632],
                [-120.27703911549631, 37.82350924181192],
                [-120.27709275967663, 37.82329737288922],
                [-120.27713567502087, 37.823068553769566],
                [-120.27712494618483, 37.82280583464618],
                [-120.27698547131602, 37.822593963704186],
                [-120.27666360623424, 37.82252616487431],
                [-120.27632028348035, 37.82258548885385],
                [-120.27603060490671, 37.82244141624936],
                [-120.27576238400525, 37.822263443820205],
                [-120.27534395939891, 37.822161745096594],
                [-120.275000636645, 37.82202614658045],
                [-120.27486116177623, 37.82178037363495],
                [-120.27489334828441, 37.8215261248991],
                [-120.27518302685802, 37.82144137512583],
                [-120.27553707844798, 37.82131425028349],
                [-120.27582675702159, 37.8211871252222],
                [-120.27610570675914, 37.82105152491548],
                [-120.27636319882458, 37.82087354913486],
                [-120.27663141972607, 37.82074642331451],
                [-120.27684599644726, 37.82055997171532],
                [-120.27696401364392, 37.82034809432631],
                [-120.27680308110304, 37.82021249247814],
                [-120.27638465649669, 37.820076890380875],
                [-120.27601987607066, 37.819924337723656],
                [-120.27579457051344, 37.81976330957679],
                [-120.27574092633311, 37.81955990509966],
                [-120.27565509564464, 37.819305648715],
                [-120.27546197659557, 37.81912766872467]
            ]
            answers = answers.map(function (n) { return context.projection(n)});
            console.log(roadScore(answers, points));
            //console.log(doPolygonsIntersect(points, answers))

            if (roadScore(answers, points) < 0.25) {
                return continueTo(stepThreeInstructions);
            } else {
                return continueTo(retryStepTwo);
            }
        }

        function continueTo(nextStep) {
            context.map().on('move.intro drawn.intro', null);
            nextStep();
        }
    }

    // retryStepTwo function
    // This function is called when the user's selection in stepTwo is incorrect
    // It decrements the user's remaining lives
    // If the user has no lives remaining, it transitions to the noLivesRemaining function
    // Otherwise, it resets the map view and reveals a message on the first road with an "OK" button
    // When the "OK" button is clicked, it transitions back to the stepTwo function
    function retryStepTwo() {
        lives -= 1;
        if(lives === 0) {
            lives = 5;
            return continueTo(noLivesRemaining);
        }
        context.enter(modeBrowse(context));
        context.history().reset('initial');
        var onClick = function() { continueTo(stepTwo); };

        revealRoad(roadOne, helpHtml('intro.testyourself.retry_step_two'),
            { buttonText: t.html('intro.ok'), buttonCallback: onClick }
        );

        context.map().on('move.intro drawn.intro', function() {
            revealRoad(roadOne, helpHtml('intro.testyourself.retry_step_two'),
                { duration: 0, buttonText: t.html('intro.ok'), buttonCallback: onClick }
            );
        });

        function continueTo(nextStep) {
            context.map().on('move.intro drawn.intro', null);
            nextStep();
        }
    }

    // stepThreeInstructions function
    // This function displays instructions for step three of the assessment
    // It calculates the transition time and duration for centering and zooming the map on the first lake
    // It centers and zooms the map on the first lake
    // After a short delay, it reveals a message with a "Start" button on the first lake
    // When the "Start" button is clicked, it transitions to the stepThree function
    function stepThreeInstructions() {
        var msec = transitionTime(lakeOne, context.map().center());
        if (msec) { reveal( null, null, { duration: 0 }); }
        context.map().centerZoomEase(lakeOne, 16.5, msec);

        var onClick = function() { continueTo(stepThree); };

        timeout(function() {
            revealLake(lakeOne, helpHtml('intro.testyourself.stepThree'),
                { buttonText: t.html('intro.testyourself.start'), buttonCallback: onClick }
            );
        }, msec + 100);

        function continueTo(nextStep) {
            context.map().on('move.intro drawn.intro', null);
            nextStep();
        }
    }

    // stepThree function
    // This function displays the third step of the assessment
    // It reveals a message on the first lake with a "Click Done" button
    // It listens for the user selecting a lake on the map
    // When the "Click Done" button is clicked, it evaluates the user's selection
    // If the user's selection matches the expected lake, it transitions to the end of the assessment
    // If the user's selection does not match the expected lake, it transitions to the retryStepThree function
    function stepThree() {
        let way = null;
        var onClick = function() { evaluateStepThree(way); };
        revealAllLake(lakeOne, helpHtml('intro.testyourself.lives_remaining')+"<br/>"+helpHtml('intro.testyourself.hearts'+lives),
            { buttonText: t.html('intro.testyourself.click_done'), buttonCallback: onClick, tooltipBox: '.intro-nav-wrap .chapter-testYourself' }
        );

        context.on('enter.intro', function(mode) {
            if (mode.id === 'select') {
                way = context.entity(context.selectedIDs()[0]);
            }
        });

        function evaluateStepThree(way) {
            if (way === null) {
                return continueTo(retryStepThree);
            }
            var graph = context.graph();
            var nodes = graph.childNodes(way);

            var loc_points = utilArrayUniq(nodes)
                .map(function(n) { return n.loc; });

            var points = utilArrayUniq(nodes)
                .map(function(n) { return context.projection(n.loc); });

            console.log(loc_points);
            var answers = [
                [-96.06984493121493, 46.44499335095648],
                [-96.0697316059092, 46.44486483282184],
                [-96.0694624583081, 46.44475908982543],
                [-96.06915081371736, 46.44466310754331],
                [-96.0689548553762, 46.44456224462393],
                [-96.06885805667757, 46.444430471818876],
                [-96.06882500346339, 46.44426941573539],
                [-96.06870695626992, 46.4441685520871],
                [-96.06853696831135, 46.44400749522929],
                [-96.0683717022405, 46.443965197389694],
                [-96.06820407522576, 46.44391476530728],
                [-96.06787826497182, 46.443869213708815],
                [-96.06773424739579, 46.44382203522743],
                [-96.06763036586553, 46.443769976166045],
                [-96.06746982168244, 46.44370815596605],
                [-96.06727622428514, 46.443682126387166],
                [-96.06702124234727, 46.44366260419485],
                [-96.06687958571511, 46.44364796254603],
                [-96.06670015398105, 46.44366423104447],
                [-96.06652544413471, 46.44366748474359],
                [-96.06634129051292, 46.44370652911772],
                [-96.06626810125296, 46.44376346877988],
                [-96.06640975788514, 46.443774856705176],
                [-96.06638614844643, 46.443844811051136],
                [-96.06642392354836, 46.44393428740921],
                [-96.06649002997668, 46.44399448051291],
                [-96.06643572826769, 46.444069315089585],
                [-96.06628462786004, 46.44404003200662],
                [-96.06617602444206, 46.444030270975446],
                [-96.06599423176414, 46.443957063186005],
                [-96.06586201890747, 46.443864333178134],
                [-96.06576049832108, 46.44379275201152],
                [-96.06568258717338, 46.44372279759872],
                [-96.06567550434178, 46.44362193293837],
                [-96.06562592452052, 46.44353733662764],
                [-96.06551496015868, 46.44346412817581],
                [-96.0654512146742, 46.44340718820082],
                [-96.06537094258263, 46.4433242184164],
                [-96.06528358765948, 46.44321196497756],
                [-96.06517970612923, 46.44315990533322],
                [-96.06517262329763, 46.4430834426404],
                [-96.0650829074306, 46.44306554710105],
                [-96.0648822272017, 46.44301186044771],
                [-96.06476418000824, 46.44300860670945],
                [-96.06464377187092, 46.44298257679633],
                [-96.06450447618263, 46.442950039387455],
                [-96.06436518049432, 46.442924009446344],
                [-96.06431560067308, 46.44301674105477],
                [-96.06425421613247, 46.44307856203935],
                [-96.0641833878164, 46.44315339787418],
                [-96.06411964233193, 46.44322660674357],
                [-96.06408895006163, 46.44330469609584],
                [-96.0640440921281, 46.44338278533615],
                [-96.0639685419243, 46.443426710484644],
                [-96.0638221634044, 46.443470635597734],
                [-96.0637230037619, 46.44350968011296],
                [-96.06362148317552, 46.443540590334344],
                [-96.06356954241039, 46.44355197830624],
                [-96.0634373295537, 46.44355848571766],
                [-96.06333580896734, 46.44351944123739],
                [-96.0632224836616, 46.443483650439255],
                [-96.06311151929975, 46.443436471623954],
                [-96.06303596909592, 46.443376277903745],
                [-96.0630005549379, 46.443319337836925],
                [-96.06299347210629, 46.44326727829518],
                [-96.06299347210629, 46.44319244261677],
                [-96.0629911111624, 46.44314038295376],
                [-96.06293444850955, 46.44309157697452],
                [-96.0629155609586, 46.44301674105477],
                [-96.06293917039729, 46.44294841251651],
                [-96.06298166738694, 46.44290286011007],
                [-96.06305957853463, 46.44283778517764],
                [-96.0631233240191, 46.44279548642988],
                [-96.06314929440165, 46.44276457578574],
                [-96.06316346006487, 46.442697873809706],
                [-96.06316818195262, 46.44263767927344],
                [-96.06316582100874, 46.44259863413324],
                [-96.0631162411875, 46.44253355883743],
                [-96.06311860213135, 46.44248312542971],
                [-96.06318706950356, 46.44242618442941],
                [-96.06325081498804, 46.442379004698346],
                [-96.06314457251393, 46.44229115267648],
                [-96.06320359611064, 46.44227162998573],
                [-96.06328859008994, 46.44226186863772],
                [-96.06335233557441, 46.44220330051295],
                [-96.06335233557441, 46.44215937437808],
                [-96.06340427633954, 46.44211056752],
                [-96.06352232353301, 46.44209429855759],
                [-96.06360495656844, 46.44208616407455],
                [-96.06372536470576, 46.44207152200206],
                [-96.06378202735863, 46.442084537177806],
                [-96.06386466039405, 46.44211056752],
                [-96.06394729342946, 46.44213659784974],
                [-96.06401103891395, 46.44214961300997],
                [-96.06409367194937, 46.442144732325254],
                [-96.0641833878164, 46.44213659784974],
                [-96.0641833878164, 46.44213659784974],
                [-96.06426838179569, 46.442105686831795],
                [-96.06426838179569, 46.44204549164122],
                [-96.06436518049432, 46.44202434196388],
                [-96.06443364786655, 46.44199993847981],
                [-96.06450447618263, 46.44196902738431],
                [-96.06459183110577, 46.44196902738431],
                [-96.06466265942186, 46.44193486246888],
                [-96.06477126283984, 46.441921847257376],
                [-96.06486806153848, 46.441933235567625],
                [-96.06492944607909, 46.44195438528034],
                [-96.0650663808235, 46.44196414668341],
                [-96.06517970612923, 46.441967400484074],
                [-96.06529539237883, 46.441967400484074],
                [-96.06540163485296, 46.44195113147891],
                [-96.06549607260771, 46.44193811627128],
                [-96.06556217903605, 46.44192998176495],
                [-96.06565425584695, 46.441921847257376],
                [-96.06575577643333, 46.441912085846695],
                [-96.0658431313565, 46.44189418992259],
                [-96.06594701288675, 46.44186978638024],
                [-96.06606978196795, 46.441863278767094],
                [-96.0661571368911, 46.44186653257377],
                [-96.06626101842136, 46.44189418992259],
                [-96.06636726089549, 46.44190557823862],
                [-96.0664735033696, 46.44192347415898],
                [-96.06657030206823, 46.44193648937009],
                [-96.06666946171075, 46.44193486246888],
                [-96.06677334324098, 46.441912085846695],
                [-96.06688430760285, 46.44186490567046],
                [-96.06695985780667, 46.44180796402402],
                [-96.06701652045952, 46.44176078375761],
                [-96.0670873487756, 46.44168269219236],
                [-96.06716289897943, 46.44161273507013],
                [-96.06722900540777, 46.44156230081003],
                [-96.0673116384432, 46.4414923435332],
                [-96.0673659401522, 46.44142726691597],
                [-96.0674037152541, 46.441380086319874],
                [-96.0674792654579, 46.44129548652805],
                [-96.06749815300886, 46.44126782887528],
                [-96.06752884527917, 46.44118973660349],
                [-96.06755481566172, 46.441124659624826],
                [-96.06755245471786, 46.441079105693504],
                [-96.06754301094239, 46.44102379015427],
                [-96.0675477328301, 46.44095220525545],
                [-96.0675099577282, 46.44091641277075],
                [-96.06739191053475, 46.44096033990778],
                [-96.06722664446389, 46.44096033990778],
                [-96.06714401142847, 46.44094732446346],
                [-96.06702360329115, 46.44092942822245],
                [-96.0668961123222, 46.44091803970238],
                [-96.06676389946551, 46.44091803970238],
                [-96.06668362737396, 46.44091966663396],
                [-96.06674737285843, 46.4408676047992],
                [-96.0667426509707, 46.44080252743576],
                [-96.06670723681265, 46.440756973235125],
                [-96.0666812664301, 46.44069352267788],
                [-96.06666710076688, 46.440639833687115],
                [-96.06669307114943, 46.44057150216781],
                [-96.06673792908295, 46.44064634144641],
                [-96.06674737285843, 46.44071629980948],
                [-96.06685361533255, 46.44072931530899],
                [-96.06693152648023, 46.440743957742214],
                [-96.0669881891331, 46.440743957742214],
                [-96.06702596423501, 46.44070165736883],
                [-96.06711568010203, 46.44070165736883],
                [-96.0671794255865, 46.440688641862735],
                [-96.0672408101271, 46.44069026880116],
                [-96.06728566806062, 46.440600787115166],
                [-96.06728330711675, 46.44053570943305],
                [-96.06730455561159, 46.44046900472819],
                [-96.06727622428514, 46.4404283310876],
                [-96.06723844918324, 46.44036813404379],
                [-96.06718178653037, 46.44031281778275],
                [-96.06715109426007, 46.440272144025556],
                [-96.06709915349495, 46.44023797804604],
                [-96.06710859727043, 46.44018916946675],
                [-96.06722192257614, 46.44020381204513],
                [-96.06727386334128, 46.44021845461959],
                [-96.06734469165735, 46.440247739756664],
                [-96.0674249637489, 46.44025262061132],
                [-96.06747690451402, 46.44020218509217],
                [-96.06757134226882, 46.44019242337338],
                [-96.06764689247262, 46.440210319856476],
                [-96.06768466757453, 46.44026075536812],
                [-96.06773660833966, 46.44028353268064],
                [-96.06779327099252, 46.44028027877943],
                [-96.06787590402794, 46.44027865182875],
                [-96.06795145423177, 46.440301429133804],
                [-96.0680340872672, 46.44033071422629],
                [-96.068109637471, 46.4403404759203],
                [-96.06818046578708, 46.44035837235474],
                [-96.06827490354186, 46.44037464183552],
                [-96.0683410099702, 46.440394165206044],
                [-96.06838586790371, 46.44042019635584],
                [-96.06842128206175, 46.44045110833009],
                [-96.06851571981652, 46.44048202028679],
                [-96.06864321078545, 46.44046087000252],
                [-96.06871167815765, 46.44048039334213],
                [-96.0687943111931, 46.44052106694384],
                [-96.06884625195822, 46.4405503519183],
                [-96.06890527555495, 46.44058614464345],
                [-96.06901151802907, 46.440630072046744],
                [-96.06906109785031, 46.44065610308385],
                [-96.06910595578384, 46.4406984034926],
                [-96.06916497938057, 46.44076022710786],
                [-96.06921455920184, 46.44079601969515],
                [-96.06925233430374, 46.44085296239918],
                [-96.06928538751791, 46.44089851651958],
                [-96.06940579565524, 46.44086923173227],
                [-96.06946718019583, 46.44095383218602],
                [-96.06947426302744, 46.44099775929287],
                [-96.06946009736423, 46.441059582568414],
                [-96.06954981323125, 46.441121405773835],
                [-96.06958994927703, 46.44118973660349],
                [-96.06952148190481, 46.44122390198616],
                [-96.06953328662418, 46.44131012880911],
                [-96.06961119777186, 46.441332905682934],
                [-96.06964189004216, 46.441500478104885],
                [-96.06957578361383, 46.44149722427633],
                [-96.06954509134353, 46.44156067389763],
                [-96.06959467116477, 46.44162412344498],
                [-96.0695238428487, 46.441650154007164],
                [-96.06947190208358, 46.441721737988956],
                [-96.0694624583081, 46.44176078375761],
                [-96.06935385489012, 46.44190720514071],
                [-96.06933260639529, 46.44195438528034],
                [-96.06920983731409, 46.4419885501835],
                [-96.06913428711026, 46.442027595760905],
                [-96.06906109785031, 46.44207965648726],
                [-96.06901860086066, 46.44211219441598],
                [-96.06896902103942, 46.44214147853519],
                [-96.06895013348846, 46.44217401642698],
                [-96.06897610387102, 46.4422260770134],
                [-96.06900443519746, 46.44226837620326],
                [-96.06904929313097, 46.44230254090954],
                [-96.06913664805414, 46.44235297448442],
                [-96.06920275448249, 46.44238713913767],
                [-96.06927830468629, 46.44242455754282],
                [-96.06936093772171, 46.44247499100474],
                [-96.06942468320618, 46.442494513622634],
                [-96.069554535119, 46.44252379753634],
                [-96.06967730420021, 46.4425547083171],
                [-96.06975757629176, 46.44257585778857],
                [-96.06982840460785, 46.44262141046841],
                [-96.06987326254136, 46.44267672438561],
                [-96.0699228423626, 46.442740172633236],
                [-96.06999130973482, 46.4427889789273],
                [-96.07011643975989, 46.44281826268273],
                [-96.0702392088411, 46.44281826268273],
                [-96.07029114960622, 46.44288496451137],
                [-96.07029587149394, 46.44296468122385],
                [-96.07034781225909, 46.443019994792536],
                [-96.07058154570214, 46.44296142748277],
                [-96.07068070534464, 46.44301023357862],
                [-96.07052724399314, 46.443003726101686],
                [-96.07036906075389, 46.44306554710105],
                [-96.07029351055009, 46.443288427489996],
                [-96.07021796034627, 46.44328517376826],
                [-96.07021087751467, 46.443338860152245],
                [-96.07020379468305, 46.44343484476754],
                [-96.07026990111139, 46.443508053258704],
                [-96.07022740412174, 46.44358776905946],
                [-96.07031003715716, 46.44366260419485],
                [-96.07029114960622, 46.44382528891711],
                [-96.0702085165708, 46.44394567529879],
                [-96.07023212600949, 46.44404653935974],
                [-96.07016838052502, 46.44413276171538],
                [-96.07008574748959, 46.44419295459977],
                [-96.07001255822964, 46.444288937710255],
                [-96.0699771440716, 46.44440444258512],
                [-96.0699228423626, 46.44450042532298],
                [-96.0698850672607, 46.44459315424808],
                [-96.06986854065362, 46.4446517198037],
                [-96.0697859076182, 46.44472818029539],
                [-96.0697929904498, 46.4447883725219],
                [-96.06980243422528, 46.44485995238038]
            ]

            answers = answers.map(function (n) { return context.projection(n)});
            console.log(similarityScore(points, answers));
            //console.log(doPolygonsIntersect(points, answers))

            if (similarityScore(points, answers) > 0.96) {
                return continueTo(play);
            } else {
                return continueTo(retryStepThree);
            }
        }

        function continueTo(nextStep) {
            context.map().on('move.intro drawn.intro', null);
            nextStep();
        }
    }

    // retryStepThree function
    // This function is called when the user's selection in stepThree is incorrect
    // It decrements the user's remaining lives
    // If the user has no lives remaining, it transitions to the noLivesRemaining function
    // Otherwise, it resets the map view and reveals a message on the first lake with an "OK" button
    // When the "OK" button is clicked, it transitions back to the stepThree function
    function retryStepThree() {
        lives -= 1;
        if(lives === 0) {
            lives = 5;
            return continueTo(noLivesRemaining);
        }
        context.enter(modeBrowse(context));
        context.history().reset('initial');
        var onClick = function() { continueTo(stepThree); };

        revealLake(lakeOne, helpHtml('intro.testyourself.retry_step_three'),
            { buttonText: t.html('intro.ok'), buttonCallback: onClick }
        );

        context.map().on('move.intro drawn.intro', function() {
            revealLake(houseOne, helpHtml('intro.testyourself.retry_step_three'),
                { duration: 0, buttonText: t.html('intro.ok'), buttonCallback: onClick }
            );
        });

        function continueTo(nextStep) {
            context.map().on('move.intro drawn.intro', null);
            nextStep();
        }
    }

    // play function
    // Dispatches 'done' event to signal assessment completion
    // Allows user to edit real maps!
    function play() {
        for (let i=0; i<8; i++) {
            setTimeout(function() {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { x: 0.2 + 0.6 * Math.random(), y: 0.4 + 0.6 * Math.random() }
                });
            }, 500*i);
        }

        dispatch.call('done');
        reveal('.ideditor',
            helpHtml('intro.testyourself.play', { next: t('intro.startediting.title') }), {
                tooltipBox: '.intro-nav-wrap .chapter-startEditing',
                buttonText: t.html('intro.ok'),
                buttonCallback: function() { reveal('.ideditor'); }
            }
        );
    }


    chapter.enter = function() {
        introTest();
    };


    chapter.exit = function() {
        timeouts.forEach(window.clearTimeout);
        context.on('enter.intro exit.intro', null);
        context.map().on('move.intro drawn.intro', null);
        context.history().on('change.intro', null);
        context.container().select('.inspector-wrap').on('wheel.intro', null);
        context.container().select('.search-header input').on('keydown.intro keyup.intro', null);
    };


    chapter.restart = function() {
        chapter.exit();
        chapter.enter();
    };


    return utilRebind(chapter, dispatch, 'on');
}
