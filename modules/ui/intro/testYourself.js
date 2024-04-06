import { dispatch as d3_dispatch } from 'd3-dispatch';

import {
    select as d3_select
} from 'd3-selection';

import { presetManager } from '../../presets';
import { t } from '../../core/localizer';
import { modeBrowse } from '../../modes/browse';
import { modeSelect } from '../../modes/select';
import { utilArrayUniq, utilRebind } from '../../util';
import { helpHtml, icon, pad, pointBox, transitionTime, isMostlySquare, similarityScore } from './helper';


export function uiIntroTestYourself(context, reveal) {
    var dispatch = d3_dispatch('done');
    var timeouts = [];
    var hallId = 'n2061';
    // var houseOne = [-106.9649527711, 44.81185248557];
    var houseOne = [-108.76815050621282, 44.757092123438795]
    var lives = 5;

    var springStreetId = 'w397';
    var springStreetEndId = 'n1834';
    var springStreet = [-85.63582, 41.94255];
    var onewayField = presetManager.field('oneway');
    var maxspeedField = presetManager.field('maxspeed');


    var chapter = {
        title: 'intro.testyourself.title'
    };


    function timeout(f, t) {
        timeouts.push(window.setTimeout(f, t));
    }


    function eventCancel(d3_event) {
        d3_event.stopPropagation();
        d3_event.preventDefault();
    }


    function isTownHallSelected() {
        var ids = context.selectedIDs();
        return ids.length === 1 && ids[0] === hallId;
    }

    function revealHouse(center, text, options) {
        var padding = 350 * Math.pow(2, context.map().zoom() - 20);
        var box = pad(center, padding, context);
        reveal(box, text, options);
    }

    function revealAll(center, text, options) {
        var box = pad(center, 100000, context);
        reveal(box, text, options);
    }

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


    function stepOneInstructions() {
        var msec = transitionTime(houseOne, context.map().center());
        if (msec) { reveal( null, null, { duration: 0 }); }
        context.map().centerZoomEase(houseOne, 19, msec);

        var onClick = function() { continueTo(stepOne); };

        timeout(function() {
            revealHouse(houseOne, helpHtml('intro.testyourself.stepOne'),
                { buttonText: t.html('intro.testyourself.start'), buttonCallback: onClick }
            );
        }, msec + 100);

        function continueTo(nextStep) {
            context.map().on('move.intro drawn.intro', null);
            nextStep();
        }
    }

    function stepOne() {
        let way = null;
        var onClick = function() { evaluateStepOne(way); };
        revealAll(houseOne, helpHtml('intro.testyourself.lives_remaining')+"<br/>"+helpHtml('intro.testyourself.hearts'+lives),
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
                return continueTo(zoomMap);
            } else {
                return continueTo(retryStepOne);
            }
        }

        function continueTo(nextStep) {
            context.map().on('move.intro drawn.intro', null);
            nextStep();
        }
    }

    function retryStepOne() {
        lives -= 1;
        if(lives === 0) {
            lives = 5;
            return continueTo(noLivesRemaining);
        }
        context.enter(modeBrowse(context));
        context.history().reset('initial');
        var onClick = function() { continueTo(stepOne); };

        revealHouse(houseOne, helpHtml('intro.testyourself.retry_step_one'),
            { buttonText: t.html('intro.ok'), buttonCallback: onClick }
        );

        context.map().on('move.intro drawn.intro', function() {
            revealHouse(houseOne, helpHtml('intro.testyourself.retry_step_one'),
                { duration: 0, buttonText: t.html('intro.ok'), buttonCallback: onClick }
            );
        });

        function continueTo(nextStep) {
            context.map().on('move.intro drawn.intro', null);
            nextStep();
        }
    }

    function noLivesRemaining() {
        var onClick = function() { continueTo(introTest); };

        revealAll(houseOne, helpHtml('intro.testyourself.no_lives_remaining'),
            { buttonText: t.html('intro.testyourself.retry'), buttonCallback: onClick, tooltipBox: '.intro-nav-wrap .chapter-testYourself' }
        );

        function continueTo(nextStep) {
            context.map().on('move.intro drawn.intro', null);
            nextStep();
        }
    }


    function zoomMap() {
        var zoomStart = context.map().zoom();

        var textId = context.lastPointerType() === 'mouse' ? 'zoom' : 'zoom_touch';
        var zoomString = helpHtml('intro.navigation.' + textId);

        reveal('.surface', zoomString);

        context.map().on('drawn.intro', function() {
            reveal('.surface', zoomString, { duration: 0 });
        });

        context.map().on('move.intro', function() {
            if (context.map().zoom() !== zoomStart) {
                context.map().on('move.intro', null);
                timeout(function() { continueTo(features); }, 3000);
            }
        });

        function continueTo(nextStep) {
            context.map().on('move.intro drawn.intro', null);
            nextStep();
        }
    }


    function features() {
        var onClick = function() { continueTo(pointsLinesAreas); };

        reveal('.surface', helpHtml('intro.navigation.features'),
            { buttonText: t.html('intro.ok'), buttonCallback: onClick }
        );

        context.map().on('drawn.intro', function() {
            reveal('.surface', helpHtml('intro.navigation.features'),
                { duration: 0, buttonText: t.html('intro.ok'), buttonCallback: onClick }
            );
        });

        function continueTo(nextStep) {
            context.map().on('drawn.intro', null);
            nextStep();
        }
    }

    function pointsLinesAreas() {
        var onClick = function() { continueTo(nodesWays); };

        reveal('.surface', helpHtml('intro.navigation.points_lines_areas'),
            { buttonText: t.html('intro.ok'), buttonCallback: onClick }
        );

        context.map().on('drawn.intro', function() {
            reveal('.surface', helpHtml('intro.navigation.points_lines_areas'),
                { duration: 0, buttonText: t.html('intro.ok'), buttonCallback: onClick }
            );
        });

        function continueTo(nextStep) {
            context.map().on('drawn.intro', null);
            nextStep();
        }
    }

    function nodesWays() {
        var onClick = function() { continueTo(clickTownHall); };

        reveal('.surface', helpHtml('intro.navigation.nodes_ways'),
            { buttonText: t.html('intro.ok'), buttonCallback: onClick }
        );

        context.map().on('drawn.intro', function() {
            reveal('.surface', helpHtml('intro.navigation.nodes_ways'),
                { duration: 0, buttonText: t.html('intro.ok'), buttonCallback: onClick }
            );
        });

        function continueTo(nextStep) {
            context.map().on('drawn.intro', null);
            nextStep();
        }
    }

    function clickTownHall() {
        context.enter(modeBrowse(context));
        context.history().reset('initial');

        var entity = context.hasEntity(hallId);
        if (!entity) return;
        reveal(null, null, { duration: 0 });
        context.map().centerZoomEase(entity.loc, 19, 500);

        timeout(function() {
            var entity = context.hasEntity(hallId);
            if (!entity) return;
            var box = pointBox(entity.loc, context);
            var textId = context.lastPointerType() === 'mouse' ? 'click_townhall' : 'tap_townhall';
            reveal(box, helpHtml('intro.navigation.' + textId));

            context.map().on('move.intro drawn.intro', function() {
                var entity = context.hasEntity(hallId);
                if (!entity) return;
                var box = pointBox(entity.loc, context);
                reveal(box, helpHtml('intro.navigation.' + textId), { duration: 0 });
            });

            context.on('enter.intro', function() {
                if (isTownHallSelected()) continueTo(selectedTownHall);
            });

        }, 550);  // after centerZoomEase

        context.history().on('change.intro', function() {
            if (!context.hasEntity(hallId)) {
                continueTo(clickTownHall);
            }
        });

        function continueTo(nextStep) {
            context.on('enter.intro', null);
            context.map().on('move.intro drawn.intro', null);
            context.history().on('change.intro', null);
            nextStep();
        }
    }


    function selectedTownHall() {
        if (!isTownHallSelected()) return clickTownHall();

        var entity = context.hasEntity(hallId);
        if (!entity) return clickTownHall();

        var box = pointBox(entity.loc, context);
        var onClick = function() { continueTo(editorTownHall); };

        reveal(box, helpHtml('intro.navigation.selected_townhall'),
            { buttonText: t.html('intro.ok'), buttonCallback: onClick }
        );

        context.map().on('move.intro drawn.intro', function() {
            var entity = context.hasEntity(hallId);
            if (!entity) return;
            var box = pointBox(entity.loc, context);
            reveal(box, helpHtml('intro.navigation.selected_townhall'),
                { duration: 0, buttonText: t.html('intro.ok'), buttonCallback: onClick }
            );
        });

        context.history().on('change.intro', function() {
            if (!context.hasEntity(hallId)) {
                continueTo(clickTownHall);
            }
        });

        function continueTo(nextStep) {
            context.map().on('move.intro drawn.intro', null);
            context.history().on('change.intro', null);
            nextStep();
        }
    }


    function editorTownHall() {
        if (!isTownHallSelected()) return clickTownHall();

        // disallow scrolling
        context.container().select('.inspector-wrap').on('wheel.intro', eventCancel);

        var onClick = function() { continueTo(presetTownHall); };

        reveal('.entity-editor-pane',
            helpHtml('intro.navigation.editor_townhall'),
            { buttonText: t.html('intro.ok'), buttonCallback: onClick }
        );

        context.on('exit.intro', function() {
            continueTo(clickTownHall);
        });

        context.history().on('change.intro', function() {
            if (!context.hasEntity(hallId)) {
                continueTo(clickTownHall);
            }
        });

        function continueTo(nextStep) {
            context.on('exit.intro', null);
            context.history().on('change.intro', null);
            context.container().select('.inspector-wrap').on('wheel.intro', null);
            nextStep();
        }
    }


    function presetTownHall() {
        if (!isTownHallSelected()) return clickTownHall();

        // reset pane, in case user happened to change it..
        context.container().select('.inspector-wrap .panewrap').style('right', '0%');
        // disallow scrolling
        context.container().select('.inspector-wrap').on('wheel.intro', eventCancel);

        // preset match, in case the user happened to change it.
        var entity = context.entity(context.selectedIDs()[0]);
        var preset = presetManager.match(entity, context.graph());

        var onClick = function() { continueTo(fieldsTownHall); };

        reveal('.entity-editor-pane .section-feature-type',
            helpHtml('intro.navigation.preset_townhall', { preset: preset.name() }),
            { buttonText: t.html('intro.ok'), buttonCallback: onClick }
        );

        context.on('exit.intro', function() {
            continueTo(clickTownHall);
        });

        context.history().on('change.intro', function() {
            if (!context.hasEntity(hallId)) {
                continueTo(clickTownHall);
            }
        });

        function continueTo(nextStep) {
            context.on('exit.intro', null);
            context.history().on('change.intro', null);
            context.container().select('.inspector-wrap').on('wheel.intro', null);
            nextStep();
        }
    }


    function fieldsTownHall() {
        if (!isTownHallSelected()) return clickTownHall();

        // reset pane, in case user happened to change it..
        context.container().select('.inspector-wrap .panewrap').style('right', '0%');
        // disallow scrolling
        context.container().select('.inspector-wrap').on('wheel.intro', eventCancel);

        var onClick = function() { continueTo(closeTownHall); };

        reveal('.entity-editor-pane .section-preset-fields',
            helpHtml('intro.navigation.fields_townhall'),
            { buttonText: t.html('intro.ok'), buttonCallback: onClick }
        );

        context.on('exit.intro', function() {
            continueTo(clickTownHall);
        });

        context.history().on('change.intro', function() {
            if (!context.hasEntity(hallId)) {
                continueTo(clickTownHall);
            }
        });

        function continueTo(nextStep) {
            context.on('exit.intro', null);
            context.history().on('change.intro', null);
            context.container().select('.inspector-wrap').on('wheel.intro', null);
            nextStep();
        }
    }


    function closeTownHall() {
        if (!isTownHallSelected()) return clickTownHall();

        var selector = '.entity-editor-pane button.close svg use';
        var href = d3_select(selector).attr('href') || '#iD-icon-close';

        reveal('.entity-editor-pane',
            helpHtml('intro.navigation.close_townhall', { button: { html: icon(href, 'inline') } })
        );

        context.on('exit.intro', function() {
            continueTo(searchStreet);
        });

        context.history().on('change.intro', function() {
            // update the close icon in the tooltip if the user edits something.
            var selector = '.entity-editor-pane button.close svg use';
            var href = d3_select(selector).attr('href') || '#iD-icon-close';

            reveal('.entity-editor-pane',
                helpHtml('intro.navigation.close_townhall', { button: { html: icon(href, 'inline') } }),
                { duration: 0 }
            );
        });

        function continueTo(nextStep) {
            context.on('exit.intro', null);
            context.history().on('change.intro', null);
            nextStep();
        }
    }


    function searchStreet() {
        context.enter(modeBrowse(context));
        context.history().reset('initial');  // ensure spring street exists

        var msec = transitionTime(springStreet, context.map().center());
        if (msec) { reveal(null, null, { duration: 0 }); }
        context.map().centerZoomEase(springStreet, 19, msec);  // ..and user can see it

        timeout(function() {
            reveal('.search-header input',
                helpHtml('intro.navigation.search_street', { name: t('intro.graph.name.spring-street') })
            );

            context.container().select('.search-header input')
                .on('keyup.intro', checkSearchResult);
        }, msec + 100);
    }


    function checkSearchResult() {
        var first = context.container().select('.feature-list-item:nth-child(0n+2)');  // skip "No Results" item
        var firstName = first.select('.entity-name');
        var name = t('intro.graph.name.spring-street');

        if (!firstName.empty() && firstName.html() === name) {
            reveal(first.node(),
                helpHtml('intro.navigation.choose_street', { name: name }),
                { duration: 300 }
            );

            context.on('exit.intro', function() {
                continueTo(selectedStreet);
            });

            context.container().select('.search-header input')
                .on('keydown.intro', eventCancel, true)
                .on('keyup.intro', null);
        }

        function continueTo(nextStep) {
            context.on('exit.intro', null);
            context.container().select('.search-header input')
                .on('keydown.intro', null)
                .on('keyup.intro', null);
            nextStep();
        }
    }


    function selectedStreet() {
        if (!context.hasEntity(springStreetEndId) || !context.hasEntity(springStreetId)) {
            return searchStreet();
        }

        var onClick = function() { continueTo(editorStreet); };
        var entity = context.entity(springStreetEndId);
        var box = pointBox(entity.loc, context);
        box.height = 500;

        reveal(box,
            helpHtml('intro.navigation.selected_street', { name: t('intro.graph.name.spring-street') }),
            { duration: 600, buttonText: t.html('intro.ok'), buttonCallback: onClick }
        );

        timeout(function() {
            context.map().on('move.intro drawn.intro', function() {
                var entity = context.hasEntity(springStreetEndId);
                if (!entity) return;
                var box = pointBox(entity.loc, context);
                box.height = 500;
                reveal(box,
                    helpHtml('intro.navigation.selected_street', { name: t('intro.graph.name.spring-street') }),
                    { duration: 0, buttonText: t.html('intro.ok'), buttonCallback: onClick }
                );
            });
        }, 600);  // after reveal.

        context.on('enter.intro', function(mode) {
            if (!context.hasEntity(springStreetId)) {
                return continueTo(searchStreet);
            }
            var ids = context.selectedIDs();
            if (mode.id !== 'select' || !ids.length || ids[0] !== springStreetId) {
                // keep Spring Street selected..
                context.enter(modeSelect(context, [springStreetId]));
            }
        });

        context.history().on('change.intro', function() {
            if (!context.hasEntity(springStreetEndId) || !context.hasEntity(springStreetId)) {
                timeout(function() {
                    continueTo(searchStreet);
                }, 300);  // after any transition (e.g. if user deleted intersection)
            }
        });

        function continueTo(nextStep) {
            context.map().on('move.intro drawn.intro', null);
            context.on('enter.intro', null);
            context.history().on('change.intro', null);
            nextStep();
        }
    }


    function editorStreet() {
        var selector = '.entity-editor-pane button.close svg use';
        var href = d3_select(selector).attr('href') || '#iD-icon-close';

        reveal('.entity-editor-pane', helpHtml('intro.navigation.street_different_fields') + '{br}' +
            helpHtml('intro.navigation.editor_street', {
                button: { html: icon(href, 'inline') },
                field1: onewayField.title(),
                field2: maxspeedField.title()
            }));

        context.on('exit.intro', function() {
            continueTo(play);
        });

        context.history().on('change.intro', function() {
            // update the close icon in the tooltip if the user edits something.
            var selector = '.entity-editor-pane button.close svg use';
            var href = d3_select(selector).attr('href') || '#iD-icon-close';

            reveal('.entity-editor-pane', helpHtml('intro.navigation.street_different_fields') + '{br}' +
                helpHtml('intro.navigation.editor_street', {
                    button: { html: icon(href, 'inline') },
                    field1: onewayField.title(),
                    field2: maxspeedField.title()
                }), { duration: 0 }
            );
        });

        function continueTo(nextStep) {
            context.on('exit.intro', null);
            context.history().on('change.intro', null);
            nextStep();
        }
    }


    function play() {
        dispatch.call('done');
        reveal('.ideditor',
            helpHtml('intro.navigation.play', { next: t('intro.points.title') }), {
                tooltipBox: '.intro-nav-wrap .chapter-point',
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
