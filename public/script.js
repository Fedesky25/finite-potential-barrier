var app = (function () {
    'use strict';

    function noop() { }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    /* components\App.svelte generated by Svelte v3.44.3 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (42:2) {#each yTicks as tick}
    function create_each_block_1(ctx) {
    	let g;
    	let line;
    	let line_x__value;
    	let text_1;
    	let t_value = /*tick*/ ctx[14] + "";
    	let t;
    	let text_1_x_value;
    	let g_transform_value;

    	return {
    		c() {
    			g = svg_element("g");
    			line = svg_element("line");
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr(line, "x1", line_x__value = /*padding*/ ctx[7].left);
    			attr(line, "x2", /*width*/ ctx[1]);
    			attr(line, "class", "svelte-190gawr");
    			attr(text_1, "x", text_1_x_value = /*padding*/ ctx[7].left - 8);
    			attr(text_1, "y", "+4");
    			attr(text_1, "class", "svelte-190gawr");
    			attr(g, "class", "tick svelte-190gawr");
    			attr(g, "transform", g_transform_value = "translate(0, " + -/*tick*/ ctx[14] * /*height*/ ctx[2] + ")");
    		},
    		m(target, anchor) {
    			insert(target, g, anchor);
    			append(g, line);
    			append(g, text_1);
    			append(text_1, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*width*/ 2) {
    				attr(line, "x2", /*width*/ ctx[1]);
    			}

    			if (dirty & /*height*/ 4 && g_transform_value !== (g_transform_value = "translate(0, " + -/*tick*/ ctx[14] * /*height*/ ctx[2] + ")")) {
    				attr(g, "transform", g_transform_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(g);
    		}
    	};
    }

    // (52:2) {#each xTicks as tick}
    function create_each_block(ctx) {
    	let g;
    	let line;
    	let line_y__value;
    	let text_1;
    	let t_value = /*tick*/ ctx[14] + "";
    	let t;
    	let text_1_y_value;
    	let g_transform_value;

    	return {
    		c() {
    			g = svg_element("g");
    			line = svg_element("line");
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr(line, "y1", line_y__value = /*padding*/ ctx[7].bottom);
    			attr(line, "y2", /*height*/ ctx[2]);
    			attr(line, "class", "svelte-190gawr");
    			attr(text_1, "y", text_1_y_value = /*height*/ ctx[2] - /*padding*/ ctx[7].bottom + 16);
    			attr(text_1, "class", "svelte-190gawr");
    			attr(g, "class", "tick svelte-190gawr");
    			attr(g, "transform", g_transform_value = "translate(" + /*tick*/ ctx[14] / /*maxE*/ ctx[4] * /*width*/ ctx[1] + ",0)");
    		},
    		m(target, anchor) {
    			insert(target, g, anchor);
    			append(g, line);
    			append(g, text_1);
    			append(text_1, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*height*/ 4) {
    				attr(line, "y2", /*height*/ ctx[2]);
    			}

    			if (dirty & /*xTicks*/ 64 && t_value !== (t_value = /*tick*/ ctx[14] + "")) set_data(t, t_value);

    			if (dirty & /*height*/ 4 && text_1_y_value !== (text_1_y_value = /*height*/ ctx[2] - /*padding*/ ctx[7].bottom + 16)) {
    				attr(text_1, "y", text_1_y_value);
    			}

    			if (dirty & /*xTicks, maxE, width*/ 82 && g_transform_value !== (g_transform_value = "translate(" + /*tick*/ ctx[14] / /*maxE*/ ctx[4] * /*width*/ ctx[1] + ",0)")) {
    				attr(g, "transform", g_transform_value);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(g);
    		}
    	};
    }

    function create_fragment(ctx) {
    	let label0;
    	let t0;
    	let input0;
    	let t1;
    	let label1;
    	let t2;
    	let input1;
    	let t3;
    	let label2;
    	let t4;
    	let input2;
    	let t5;
    	let svg_1;
    	let g0;
    	let g1;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*yTicks*/ ctx[8];
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*xTicks*/ ctx[6];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c() {
    			label0 = element("label");
    			t0 = text("Maximum energy value [eV]\r\n    ");
    			input0 = element("input");
    			t1 = space();
    			label1 = element("label");
    			t2 = text("Barrier potential [eV]\r\n    ");
    			input1 = element("input");
    			t3 = space();
    			label2 = element("label");
    			t4 = text("Barrier length [Å]\r\n    ");
    			input2 = element("input");
    			t5 = space();
    			svg_1 = svg_element("svg");
    			g0 = svg_element("g");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			g1 = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr(input0, "type", "range");
    			attr(input0, "min", "1");
    			attr(input0, "max", "30");
    			attr(input1, "type", "range");
    			attr(input1, "min", "1");
    			attr(input1, "max", "20");
    			attr(input2, "type", "number");
    			attr(input2, "min", "0");
    			attr(g0, "class", "axis y-axis svelte-190gawr");
    			attr(g1, "class", "axis x-axis svelte-190gawr");
    			attr(svg_1, "class", "svelte-190gawr");
    		},
    		m(target, anchor) {
    			insert(target, label0, anchor);
    			append(label0, t0);
    			append(label0, input0);
    			set_input_value(input0, /*maxE*/ ctx[4]);
    			insert(target, t1, anchor);
    			insert(target, label1, anchor);
    			append(label1, t2);
    			append(label1, input1);
    			set_input_value(input1, /*V0*/ ctx[5]);
    			insert(target, t3, anchor);
    			insert(target, label2, anchor);
    			append(label2, t4);
    			append(label2, input2);
    			set_input_value(input2, /*l*/ ctx[0]);
    			insert(target, t5, anchor);
    			insert(target, svg_1, anchor);
    			append(svg_1, g0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(g0, null);
    			}

    			append(svg_1, g1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g1, null);
    			}

    			/*svg_1_binding*/ ctx[13](svg_1);

    			if (!mounted) {
    				dispose = [
    					listen(window, "resize", /*resize*/ ctx[9]),
    					listen(input0, "change", /*input0_change_input_handler*/ ctx[10]),
    					listen(input0, "input", /*input0_change_input_handler*/ ctx[10]),
    					listen(input1, "change", /*input1_change_input_handler*/ ctx[11]),
    					listen(input1, "input", /*input1_change_input_handler*/ ctx[11]),
    					listen(input2, "input", /*input2_input_handler*/ ctx[12])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (dirty & /*maxE*/ 16) {
    				set_input_value(input0, /*maxE*/ ctx[4]);
    			}

    			if (dirty & /*V0*/ 32) {
    				set_input_value(input1, /*V0*/ ctx[5]);
    			}

    			if (dirty & /*l*/ 1 && to_number(input2.value) !== /*l*/ ctx[0]) {
    				set_input_value(input2, /*l*/ ctx[0]);
    			}

    			if (dirty & /*yTicks, height, padding, width*/ 390) {
    				each_value_1 = /*yTicks*/ ctx[8];
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(g0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*xTicks, maxE, width, height, padding*/ 214) {
    				each_value = /*xTicks*/ ctx[6];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(label0);
    			if (detaching) detach(t1);
    			if (detaching) detach(label1);
    			if (detaching) detach(t3);
    			if (detaching) detach(label2);
    			if (detaching) detach(t5);
    			if (detaching) detach(svg_1);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			/*svg_1_binding*/ ctx[13](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let xTicks;
    	let width = 400;
    	let height = 500;
    	const padding = { top: 20, right: 40, bottom: 40, left: 25 };

    	/**@type {HTMLSvgElement}*/
    	let svg;

    	/** maximum Energy [eV] */
    	let maxE = 15;

    	/** barrier poential [eV] */
    	let V0 = 5;

    	/** barrier length [A] */
    	let l = 0;

    	const yTicks = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];

    	function resize() {
    		$$invalidate(1, { width, height } = svg.getBoundingClientRect(), width, $$invalidate(2, height));
    	}

    	onMount(resize);

    	function input0_change_input_handler() {
    		maxE = to_number(this.value);
    		$$invalidate(4, maxE);
    	}

    	function input1_change_input_handler() {
    		V0 = to_number(this.value);
    		$$invalidate(5, V0);
    	}

    	function input2_input_handler() {
    		l = to_number(this.value);
    		$$invalidate(0, l);
    	}

    	function svg_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			svg = $$value;
    			$$invalidate(3, svg);
    		});
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*l*/ 1) {
    			if (l < 0) $$invalidate(0, l = 0.1);
    		}
    	};

    	$$invalidate(6, xTicks = []);

    	return [
    		l,
    		width,
    		height,
    		svg,
    		maxE,
    		V0,
    		xTicks,
    		padding,
    		yTicks,
    		resize,
    		input0_change_input_handler,
    		input1_change_input_handler,
    		input2_input_handler,
    		svg_1_binding
    	];
    }

    class App$1 extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, {});
    	}
    }

    var App = new App$1({target: document.body});

    return App;

})();
