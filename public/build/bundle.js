
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
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
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
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
        flushing = false;
        seen_callbacks.clear();
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
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
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
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
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
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.18.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/Question.svelte generated by Svelte v3.18.2 */

    const { console: console_1 } = globals;
    const file = "src/Question.svelte";

    function create_fragment(ctx) {
    	let fieldset;
    	let div10;
    	let legend;
    	let h2;
    	let t0;
    	let t1;
    	let div1;
    	let div0;
    	let input0;
    	let t2;
    	let label0;
    	let t4;
    	let div3;
    	let div2;
    	let input1;
    	let t5;
    	let label1;
    	let t7;
    	let div5;
    	let div4;
    	let input2;
    	let t8;
    	let label2;
    	let t10;
    	let div7;
    	let div6;
    	let input3;
    	let t11;
    	let label3;
    	let t13;
    	let div9;
    	let div8;
    	let input4;
    	let t14;
    	let label4;
    	let t16;
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			fieldset = element("fieldset");
    			div10 = element("div");
    			legend = element("legend");
    			h2 = element("h2");
    			t0 = text(/*question*/ ctx[0]);
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			input0 = element("input");
    			t2 = space();
    			label0 = element("label");
    			label0.textContent = "Not at All";
    			t4 = space();
    			div3 = element("div");
    			div2 = element("div");
    			input1 = element("input");
    			t5 = space();
    			label1 = element("label");
    			label1.textContent = "Rarely";
    			t7 = space();
    			div5 = element("div");
    			div4 = element("div");
    			input2 = element("input");
    			t8 = space();
    			label2 = element("label");
    			label2.textContent = "Sometimes";
    			t10 = space();
    			div7 = element("div");
    			div6 = element("div");
    			input3 = element("input");
    			t11 = space();
    			label3 = element("label");
    			label3.textContent = "Often";
    			t13 = space();
    			div9 = element("div");
    			div8 = element("div");
    			input4 = element("input");
    			t14 = space();
    			label4 = element("label");
    			label4.textContent = "Very Often";
    			t16 = space();
    			button = element("button");
    			button.textContent = "Next";
    			attr_dev(h2, "class", "svelte-14mzx3d");
    			add_location(h2, file, 24, 6, 341);
    			add_location(legend, file, 23, 4, 326);
    			attr_dev(input0, "type", "radio");
    			attr_dev(input0, "id", "choice1");
    			attr_dev(input0, "name", "contact");
    			input0.value = "0";
    			attr_dev(input0, "class", "form-check-input");
    			add_location(input0, file, 28, 8, 441);
    			attr_dev(label0, "for", "choice1");
    			attr_dev(label0, "class", "form-check-label");
    			add_location(label0, file, 34, 8, 585);
    			attr_dev(div0, "class", "form-check");
    			add_location(div0, file, 27, 6, 408);
    			attr_dev(div1, "class", "form-row");
    			add_location(div1, file, 26, 4, 379);
    			attr_dev(input1, "type", "radio");
    			attr_dev(input1, "id", "choice2");
    			attr_dev(input1, "name", "contact");
    			input1.value = "1";
    			attr_dev(input1, "class", "form-check-input");
    			add_location(input1, file, 40, 8, 741);
    			attr_dev(label1, "for", "choice2");
    			attr_dev(label1, "class", "form-check-label");
    			add_location(label1, file, 46, 8, 885);
    			attr_dev(div2, "class", "form-check");
    			add_location(div2, file, 39, 6, 708);
    			attr_dev(div3, "class", "form-row");
    			add_location(div3, file, 38, 4, 679);
    			attr_dev(input2, "type", "radio");
    			attr_dev(input2, "id", "choice3");
    			attr_dev(input2, "name", "contact");
    			input2.value = "2";
    			attr_dev(input2, "class", "form-check-input");
    			add_location(input2, file, 52, 8, 1037);
    			attr_dev(label2, "for", "choice3");
    			attr_dev(label2, "class", "form-check-label");
    			add_location(label2, file, 58, 8, 1181);
    			attr_dev(div4, "class", "form-check");
    			add_location(div4, file, 51, 6, 1004);
    			attr_dev(div5, "class", "form-row");
    			add_location(div5, file, 50, 4, 975);
    			attr_dev(input3, "type", "radio");
    			attr_dev(input3, "id", "choice4");
    			attr_dev(input3, "name", "contact");
    			input3.value = "3";
    			attr_dev(input3, "class", "form-check-input");
    			add_location(input3, file, 64, 8, 1336);
    			attr_dev(label3, "for", "choice4");
    			attr_dev(label3, "class", "form-check-label");
    			add_location(label3, file, 70, 8, 1480);
    			attr_dev(div6, "class", "form-check");
    			add_location(div6, file, 63, 6, 1303);
    			attr_dev(div7, "class", "form-row");
    			add_location(div7, file, 62, 4, 1274);
    			attr_dev(input4, "type", "radio");
    			attr_dev(input4, "id", "choice5");
    			attr_dev(input4, "name", "contact");
    			input4.value = "4";
    			attr_dev(input4, "class", "form-check-input");
    			add_location(input4, file, 76, 8, 1631);
    			attr_dev(label4, "for", "choice5");
    			attr_dev(label4, "class", "form-check-label");
    			add_location(label4, file, 82, 8, 1775);
    			attr_dev(div8, "class", "form-check");
    			add_location(div8, file, 75, 6, 1598);
    			attr_dev(div9, "class", "form-row");
    			add_location(div9, file, 74, 4, 1569);
    			attr_dev(div10, "class", "form-group svelte-14mzx3d");
    			add_location(div10, file, 22, 2, 297);
    			attr_dev(button, "type", "submit");
    			attr_dev(button, "class", "btn btn-info");
    			add_location(button, file, 86, 2, 1875);
    			attr_dev(fieldset, "class", "form-group svelte-14mzx3d");
    			add_location(fieldset, file, 21, 0, 265);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, fieldset, anchor);
    			append_dev(fieldset, div10);
    			append_dev(div10, legend);
    			append_dev(legend, h2);
    			append_dev(h2, t0);
    			append_dev(div10, t1);
    			append_dev(div10, div1);
    			append_dev(div1, div0);
    			append_dev(div0, input0);
    			append_dev(div0, t2);
    			append_dev(div0, label0);
    			append_dev(div10, t4);
    			append_dev(div10, div3);
    			append_dev(div3, div2);
    			append_dev(div2, input1);
    			append_dev(div2, t5);
    			append_dev(div2, label1);
    			append_dev(div10, t7);
    			append_dev(div10, div5);
    			append_dev(div5, div4);
    			append_dev(div4, input2);
    			append_dev(div4, t8);
    			append_dev(div4, label2);
    			append_dev(div10, t10);
    			append_dev(div10, div7);
    			append_dev(div7, div6);
    			append_dev(div6, input3);
    			append_dev(div6, t11);
    			append_dev(div6, label3);
    			append_dev(div10, t13);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, input4);
    			append_dev(div8, t14);
    			append_dev(div8, label4);
    			append_dev(fieldset, t16);
    			append_dev(fieldset, button);
    			dispose = listen_dev(button, "click", /*handleSubmit*/ ctx[1], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*question*/ 1) set_data_dev(t0, /*question*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(fieldset);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { question } = $$props;
    	let { onSubmit } = $$props;

    	function handleSubmit(event) {
    		console.log("click");
    		onSubmit();
    	}

    	const writable_props = ["question", "onSubmit"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Question> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("question" in $$props) $$invalidate(0, question = $$props.question);
    		if ("onSubmit" in $$props) $$invalidate(2, onSubmit = $$props.onSubmit);
    	};

    	$$self.$capture_state = () => {
    		return { question, onSubmit };
    	};

    	$$self.$inject_state = $$props => {
    		if ("question" in $$props) $$invalidate(0, question = $$props.question);
    		if ("onSubmit" in $$props) $$invalidate(2, onSubmit = $$props.onSubmit);
    	};

    	return [question, handleSubmit, onSubmit];
    }

    class Question extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { question: 0, onSubmit: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Question",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*question*/ ctx[0] === undefined && !("question" in props)) {
    			console_1.warn("<Question> was created without expected prop 'question'");
    		}

    		if (/*onSubmit*/ ctx[2] === undefined && !("onSubmit" in props)) {
    			console_1.warn("<Question> was created without expected prop 'onSubmit'");
    		}
    	}

    	get question() {
    		throw new Error("<Question>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set question(value) {
    		throw new Error("<Question>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onSubmit() {
    		throw new Error("<Question>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onSubmit(value) {
    		throw new Error("<Question>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Questionaire.svelte generated by Svelte v3.18.2 */

    const { console: console_1$1 } = globals;
    const file$1 = "src/Questionaire.svelte";

    // (15:0) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Complete";
    			add_location(p, file$1, 15, 2, 310);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(15:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (13:0) {#if question}
    function create_if_block(ctx) {
    	let current;

    	const question_1 = new Question({
    			props: {
    				question: /*question*/ ctx[0],
    				onSubmit: /*handleSubmit*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(question_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(question_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const question_1_changes = {};
    			if (dirty & /*question*/ 1) question_1_changes.question = /*question*/ ctx[0];
    			question_1.$set(question_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(question_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(question_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(question_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(13:0) {#if question}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*question*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { questions } = $$props;
    	let questionIndex = 0;

    	function handleSubmit() {
    		console.log("CLICK");
    		$$invalidate(3, questionIndex++, questionIndex);
    	}

    	const writable_props = ["questions"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Questionaire> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("questions" in $$props) $$invalidate(2, questions = $$props.questions);
    	};

    	$$self.$capture_state = () => {
    		return { questions, questionIndex, question };
    	};

    	$$self.$inject_state = $$props => {
    		if ("questions" in $$props) $$invalidate(2, questions = $$props.questions);
    		if ("questionIndex" in $$props) $$invalidate(3, questionIndex = $$props.questionIndex);
    		if ("question" in $$props) $$invalidate(0, question = $$props.question);
    	};

    	let question;

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*questions, questionIndex*/ 12) {
    			 $$invalidate(0, question = questions[questionIndex]);
    		}
    	};

    	return [question, handleSubmit, questions];
    }

    class Questionaire extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { questions: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Questionaire",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*questions*/ ctx[2] === undefined && !("questions" in props)) {
    			console_1$1.warn("<Questionaire> was created without expected prop 'questions'");
    		}
    	}

    	get questions() {
    		throw new Error("<Questionaire>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set questions(value) {
    		throw new Error("<Questionaire>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.18.2 */
    const file$2 = "src/App.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let current;

    	const questionaire = new Questionaire({
    			props: {
    				questions: [
    					"I feel run down and drained of physical or emotional energy.",
    					"I have negative thoughts about my job.",
    					"I am harder and less sympathetic with people than perhaps they deserve.",
    					"I am easily irritated by small problems, or by my co-workers and team.",
    					"I feel misunderstood or unappreciated by my co-workers.",
    					"I feel that I have no one to talk to.",
    					"I feel that I am achieving less than I should."
    				]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(questionaire.$$.fragment);
    			attr_dev(div, "class", "cont text-center svelte-7iq4pw");
    			add_location(div, file$2, 11, 0, 151);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(questionaire, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(questionaire.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(questionaire.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(questionaire);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
