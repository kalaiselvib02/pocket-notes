
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
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
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
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
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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
        else if (callback) {
            callback();
        }
    }

    function bind(component, name, callback, value) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            if (value === undefined) {
                callback(component.$$.ctx[index]);
            }
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
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
            ctx: [],
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
            if (!is_function(callback)) {
                return noop;
            }
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

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.55.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const APP_CONSTANTS = {
        LAYOUT_OPTIONS : [
          {
                LABEL : "5 Column Layout",
                CLASS_NAME :"five-col-layout"
            },
           {
                LABEL : "2 Column Layout",
                CLASS_NAME :"two-col-layout"
            }
        ],
        MODAL_DATA : {
            ADD_NOTE : {
                MODAL_TITLE : "New Note",
                
                BUTTON_LABELS : {
                    CANCEL : "CANCEL",
                    ADD_NOTE : "ADD NOTE"
                }
            },
            DELETE_NOTE : {
                MODAL_TITLE : "Confirm Delete",
                MODAL_DESCRIPTION_TEXT : "Deleting this note will remove all its traces from the system and cannot be rolled back. Do you really wish to delete this note?",
                BUTTON_LABELS : {
                    NO : "NO",
                    YES : "YES"
                }
            }
        },
        FORM_INPUT_DATA : {
            INPUT_FIELDS : {
                ADD_NOTE: {
                    NOTE_TITLE : {
                        LABEL : "Note Title",   
                    },
                    NOTE_DESCRIPTION : {
                        LABEL : "Note Description",
                    },
                    NOTE_BACKGROUND : {
                        LABEL : "Note Background",
                        BG_COLORS : [
                            {
                                CODE:"#b8e986",                           
                            },
                            {
                                CODE:"#d2e3f8",                         
                            },
                            {
                                CODE:"#dededf",                           
                            },
                            {
                                CODE:"#dccdcf",                        
                            }
                        ],
                        DEFAULT_BG : "#b8e986"

                    }
                }
            }     
        },
        ERROR_MESSAGES : {
            ADD_NOTE :   {
                NOTE_TITLE : {
                    TITLE_REQUIRED_ERROR: "Please enter note title",
                    TITLE_MAX_LENGTH_ERROR : "Please enter note title less than 60 characters"
                },
                NOTE_DESCRIPTION : {
                    DESCRIPTION_REQUIRED_ERROR: "Please enter note description",
                    DESCRIPTION_MAX_LENGTH_ERROR : "Please enter note description less than 255 characters"
                }
            }
        }

       
    };

    /* src/components/Modal.svelte generated by Svelte v3.55.0 */
    const file$7 = "src/components/Modal.svelte";
    const get_footer_slot_changes_1 = dirty => ({});
    const get_footer_slot_context_1 = ctx => ({});
    const get_footer_slot_changes = dirty => ({});
    const get_footer_slot_context = ctx => ({});

    function create_fragment$7(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let h40;
    	let t0;
    	let t1;
    	let form;
    	let div1;
    	let t2;
    	let div2;
    	let div4_class_value;
    	let t3;
    	let div9;
    	let div8;
    	let div5;
    	let h41;
    	let t4;
    	let t5;
    	let div6;
    	let p;
    	let t7;
    	let div7;
    	let div9_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	const footer_slot_template = /*#slots*/ ctx[4].footer;
    	const footer_slot = create_slot(footer_slot_template, ctx, /*$$scope*/ ctx[3], get_footer_slot_context);
    	const footer_slot_template_1 = /*#slots*/ ctx[4].footer;
    	const footer_slot_1 = create_slot(footer_slot_template_1, ctx, /*$$scope*/ ctx[3], get_footer_slot_context_1);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			h40 = element("h4");
    			t0 = text(/*title*/ ctx[2]);
    			t1 = space();
    			form = element("form");
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			t2 = space();
    			div2 = element("div");
    			if (footer_slot) footer_slot.c();
    			t3 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div5 = element("div");
    			h41 = element("h4");
    			t4 = text(/*title*/ ctx[2]);
    			t5 = space();
    			div6 = element("div");
    			p = element("p");
    			p.textContent = `${APP_CONSTANTS.MODAL_DATA.DELETE_NOTE.MODAL_DESCRIPTION_TEXT}`;
    			t7 = space();
    			div7 = element("div");
    			if (footer_slot_1) footer_slot_1.c();
    			attr_dev(h40, "class", "svelte-s91d78");
    			add_location(h40, file$7, 11, 12, 345);
    			attr_dev(div0, "class", "modal-header svelte-s91d78");
    			add_location(div0, file$7, 10, 8, 306);
    			attr_dev(div1, "class", "modal-body");
    			add_location(div1, file$7, 14, 12, 433);
    			attr_dev(div2, "class", "modal-footer svelte-s91d78");
    			add_location(div2, file$7, 17, 12, 512);
    			attr_dev(form, "action", "");
    			attr_dev(form, "id", "add-note-form");
    			add_location(form, file$7, 13, 8, 385);
    			attr_dev(div3, "class", "modal svelte-s91d78");
    			add_location(div3, file$7, 9, 4, 277);

    			attr_dev(div4, "class", div4_class_value = "" + (null_to_empty(/*showAddNoteModal*/ ctx[0]
    			? "show modal-container"
    			: "modal-container") + " svelte-s91d78"));

    			add_location(div4, file$7, 8, 0, 186);
    			attr_dev(h41, "class", "svelte-s91d78");
    			add_location(h41, file$7, 29, 12, 858);
    			attr_dev(div5, "class", "modal-header svelte-s91d78");
    			add_location(div5, file$7, 28, 8, 819);
    			attr_dev(p, "class", "confirm-desc-text svelte-s91d78");
    			add_location(p, file$7, 32, 12, 935);
    			attr_dev(div6, "class", "modal-body");
    			add_location(div6, file$7, 31, 8, 898);
    			attr_dev(div7, "class", "modal-footer svelte-s91d78");
    			add_location(div7, file$7, 34, 8, 1053);
    			attr_dev(div8, "class", "modal svelte-s91d78");
    			add_location(div8, file$7, 27, 4, 790);

    			attr_dev(div9, "class", div9_class_value = "" + (null_to_empty(/*showDeleteNoteModal*/ ctx[1]
    			? "show modal-container"
    			: "modal-container") + " svelte-s91d78"));

    			add_location(div9, file$7, 26, 0, 696);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h40);
    			append_dev(h40, t0);
    			append_dev(div3, t1);
    			append_dev(div3, form);
    			append_dev(form, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			append_dev(form, t2);
    			append_dev(form, div2);

    			if (footer_slot) {
    				footer_slot.m(div2, null);
    			}

    			insert_dev(target, t3, anchor);
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div8);
    			append_dev(div8, div5);
    			append_dev(div5, h41);
    			append_dev(h41, t4);
    			append_dev(div8, t5);
    			append_dev(div8, div6);
    			append_dev(div6, p);
    			append_dev(div8, t7);
    			append_dev(div8, div7);

    			if (footer_slot_1) {
    				footer_slot_1.m(div7, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div4, "cancel", /*cancel_handler*/ ctx[6], false, false, false),
    					listen_dev(div9, "cancel", /*cancel_handler_1*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 4) set_data_dev(t0, /*title*/ ctx[2]);

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			if (footer_slot) {
    				if (footer_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						footer_slot,
    						footer_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(footer_slot_template, /*$$scope*/ ctx[3], dirty, get_footer_slot_changes),
    						get_footer_slot_context
    					);
    				}
    			}

    			if (!current || dirty & /*showAddNoteModal*/ 1 && div4_class_value !== (div4_class_value = "" + (null_to_empty(/*showAddNoteModal*/ ctx[0]
    			? "show modal-container"
    			: "modal-container") + " svelte-s91d78"))) {
    				attr_dev(div4, "class", div4_class_value);
    			}

    			if (!current || dirty & /*title*/ 4) set_data_dev(t4, /*title*/ ctx[2]);

    			if (footer_slot_1) {
    				if (footer_slot_1.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						footer_slot_1,
    						footer_slot_template_1,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(footer_slot_template_1, /*$$scope*/ ctx[3], dirty, get_footer_slot_changes_1),
    						get_footer_slot_context_1
    					);
    				}
    			}

    			if (!current || dirty & /*showDeleteNoteModal*/ 2 && div9_class_value !== (div9_class_value = "" + (null_to_empty(/*showDeleteNoteModal*/ ctx[1]
    			? "show modal-container"
    			: "modal-container") + " svelte-s91d78"))) {
    				attr_dev(div9, "class", div9_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			transition_in(footer_slot, local);
    			transition_in(footer_slot_1, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			transition_out(footer_slot, local);
    			transition_out(footer_slot_1, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (default_slot) default_slot.d(detaching);
    			if (footer_slot) footer_slot.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div9);
    			if (footer_slot_1) footer_slot_1.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modal', slots, ['default','footer']);
    	let { showAddNoteModal } = $$props;
    	let { showDeleteNoteModal } = $$props;
    	let { title } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (showAddNoteModal === undefined && !('showAddNoteModal' in $$props || $$self.$$.bound[$$self.$$.props['showAddNoteModal']])) {
    			console.warn("<Modal> was created without expected prop 'showAddNoteModal'");
    		}

    		if (showDeleteNoteModal === undefined && !('showDeleteNoteModal' in $$props || $$self.$$.bound[$$self.$$.props['showDeleteNoteModal']])) {
    			console.warn("<Modal> was created without expected prop 'showDeleteNoteModal'");
    		}

    		if (title === undefined && !('title' in $$props || $$self.$$.bound[$$self.$$.props['title']])) {
    			console.warn("<Modal> was created without expected prop 'title'");
    		}
    	});

    	const writable_props = ['showAddNoteModal', 'showDeleteNoteModal', 'title'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	function cancel_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function cancel_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('showAddNoteModal' in $$props) $$invalidate(0, showAddNoteModal = $$props.showAddNoteModal);
    		if ('showDeleteNoteModal' in $$props) $$invalidate(1, showDeleteNoteModal = $$props.showDeleteNoteModal);
    		if ('title' in $$props) $$invalidate(2, title = $$props.title);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		APP_CONSTANTS,
    		showAddNoteModal,
    		showDeleteNoteModal,
    		title
    	});

    	$$self.$inject_state = $$props => {
    		if ('showAddNoteModal' in $$props) $$invalidate(0, showAddNoteModal = $$props.showAddNoteModal);
    		if ('showDeleteNoteModal' in $$props) $$invalidate(1, showDeleteNoteModal = $$props.showDeleteNoteModal);
    		if ('title' in $$props) $$invalidate(2, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		showAddNoteModal,
    		showDeleteNoteModal,
    		title,
    		$$scope,
    		slots,
    		cancel_handler_1,
    		cancel_handler
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			showAddNoteModal: 0,
    			showDeleteNoteModal: 1,
    			title: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get showAddNoteModal() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showAddNoteModal(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showDeleteNoteModal() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showDeleteNoteModal(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Button.svelte generated by Svelte v3.55.0 */

    const file$6 = "src/components/Button.svelte";

    function create_fragment$6(ctx) {
    	let button;
    	let button_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "type", /*type*/ ctx[0]);
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*className*/ ctx[1]) + " svelte-e9a14a"));
    			button.disabled = /*disabled*/ ctx[2];
    			add_location(button, file$6, 6, 0, 100);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*type*/ 1) {
    				attr_dev(button, "type", /*type*/ ctx[0]);
    			}

    			if (!current || dirty & /*className*/ 2 && button_class_value !== (button_class_value = "" + (null_to_empty(/*className*/ ctx[1]) + " svelte-e9a14a"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (!current || dirty & /*disabled*/ 4) {
    				prop_dev(button, "disabled", /*disabled*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, ['default']);
    	let { type = null } = $$props;
    	let { className = null } = $$props;
    	let { disabled = false } = $$props;
    	const writable_props = ['type', 'className', 'disabled'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('type' in $$props) $$invalidate(0, type = $$props.type);
    		if ('className' in $$props) $$invalidate(1, className = $$props.className);
    		if ('disabled' in $$props) $$invalidate(2, disabled = $$props.disabled);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ type, className, disabled });

    	$$self.$inject_state = $$props => {
    		if ('type' in $$props) $$invalidate(0, type = $$props.type);
    		if ('className' in $$props) $$invalidate(1, className = $$props.className);
    		if ('disabled' in $$props) $$invalidate(2, disabled = $$props.disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [type, className, disabled, $$scope, slots, click_handler];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { type: 0, className: 1, disabled: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get className() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set className(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/TextInput.svelte generated by Svelte v3.55.0 */
    const file$5 = "src/components/TextInput.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	return child_ctx;
    }

    // (59:0) {:else}
    function create_else_block(ctx) {
    	let div;
    	let input;
    	let t0;
    	let span0;
    	let t1;
    	let t2;
    	let span1;
    	let t3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			span0 = element("span");
    			t1 = text(/*errorMessageTitle*/ ctx[8]);
    			t2 = space();
    			span1 = element("span");
    			t3 = text(/*errorMessageTitleMaxLength*/ ctx[10]);
    			attr_dev(input, "type", /*type*/ ctx[4]);
    			attr_dev(input, "name", /*name*/ ctx[0]);
    			attr_dev(input, "id", /*id*/ ctx[3]);
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[2]);
    			attr_dev(input, "class", "input-item svelte-1y35szn");
    			input.value = /*value*/ ctx[6];
    			add_location(input, file$5, 60, 8, 1927);
    			attr_dev(span0, "class", "error-text error-text-title svelte-1y35szn");
    			toggle_class(span0, "show", /*errorMessageTitle*/ ctx[8] && !/*requiredTitle*/ ctx[7] && /*touched*/ ctx[16]);
    			add_location(span0, file$5, 70, 7, 2147);
    			attr_dev(span1, "class", "error-text error-text-title svelte-1y35szn");
    			toggle_class(span1, "show", /*errorMessageTitleMaxLength*/ ctx[10] && !/*requiredTitleMaxLength*/ ctx[9] && /*touched*/ ctx[16]);
    			add_location(span1, file$5, 71, 7, 2283);
    			attr_dev(div, "class", "form-group svelte-1y35szn");
    			add_location(div, file$5, 59, 4, 1894);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			append_dev(div, t0);
    			append_dev(div, span0);
    			append_dev(span0, t1);
    			append_dev(div, t2);
    			append_dev(div, span1);
    			append_dev(span1, t3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_handler_2*/ ctx[20], false, false, false),
    					listen_dev(input, "blur", /*blur_handler_1*/ ctx[24], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*type*/ 16) {
    				attr_dev(input, "type", /*type*/ ctx[4]);
    			}

    			if (dirty & /*name*/ 1) {
    				attr_dev(input, "name", /*name*/ ctx[0]);
    			}

    			if (dirty & /*id*/ 8) {
    				attr_dev(input, "id", /*id*/ ctx[3]);
    			}

    			if (dirty & /*placeholder*/ 4) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[2]);
    			}

    			if (dirty & /*value*/ 64 && input.value !== /*value*/ ctx[6]) {
    				prop_dev(input, "value", /*value*/ ctx[6]);
    			}

    			if (dirty & /*errorMessageTitle*/ 256) set_data_dev(t1, /*errorMessageTitle*/ ctx[8]);

    			if (dirty & /*errorMessageTitle, requiredTitle, touched*/ 65920) {
    				toggle_class(span0, "show", /*errorMessageTitle*/ ctx[8] && !/*requiredTitle*/ ctx[7] && /*touched*/ ctx[16]);
    			}

    			if (dirty & /*errorMessageTitleMaxLength*/ 1024) set_data_dev(t3, /*errorMessageTitleMaxLength*/ ctx[10]);

    			if (dirty & /*errorMessageTitleMaxLength, requiredTitleMaxLength, touched*/ 67072) {
    				toggle_class(span1, "show", /*errorMessageTitleMaxLength*/ ctx[10] && !/*requiredTitleMaxLength*/ ctx[9] && /*touched*/ ctx[16]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(59:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (46:32) 
    function create_if_block_1(ctx) {
    	let div1;
    	let div0;
    	let label;
    	let t1;
    	let each_value = /*bgColorOptions*/ ctx[17];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			label = element("label");
    			label.textContent = `${APP_CONSTANTS.FORM_INPUT_DATA.INPUT_FIELDS.ADD_NOTE.NOTE_BACKGROUND.LABEL}`;
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(label, "class", "mr-2 svelte-1y35szn");
    			add_location(label, file$5, 48, 8, 1411);
    			attr_dev(div0, "class", "input-group svelte-1y35szn");
    			add_location(div0, file$5, 47, 4, 1377);
    			attr_dev(div1, "class", "form-group bg-choice-group svelte-1y35szn");
    			add_location(div1, file$5, 46, 0, 1332);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, label);
    			append_dev(div0, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*bgColorOptions, colors*/ 163840) {
    				each_value = /*bgColorOptions*/ ctx[17];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(46:32) ",
    		ctx
    	});

    	return block;
    }

    // (30:0) {#if inputType === "textarea"}
    function create_if_block$3(ctx) {
    	let div;
    	let textarea;
    	let t0;
    	let span0;
    	let t1;
    	let t2;
    	let span1;
    	let t3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			textarea = element("textarea");
    			t0 = space();
    			span0 = element("span");
    			t1 = text(/*errorMessageDescription*/ ctx[12]);
    			t2 = space();
    			span1 = element("span");
    			t3 = text(/*errorMessageDescriptionMaxLength*/ ctx[14]);
    			attr_dev(textarea, "name", /*name*/ ctx[0]);
    			attr_dev(textarea, "id", /*id*/ ctx[3]);
    			attr_dev(textarea, "rows", /*rows*/ ctx[5]);
    			attr_dev(textarea, "class", "input-item svelte-1y35szn");
    			attr_dev(textarea, "placeholder", /*placeholder*/ ctx[2]);
    			textarea.value = /*value*/ ctx[6];
    			add_location(textarea, file$5, 31, 4, 770);
    			attr_dev(span0, "class", "error-text error-text-title svelte-1y35szn");
    			toggle_class(span0, "show", /*errorMessageDescription*/ ctx[12] && !/*requiredDescription*/ ctx[11] && /*touched*/ ctx[16]);
    			add_location(span0, file$5, 41, 4, 964);
    			attr_dev(span1, "class", "error-text error-text-title svelte-1y35szn");
    			toggle_class(span1, "show", /*errorMessageDescriptionMaxLength*/ ctx[14] && !/*requiredDescriptionMaxLength*/ ctx[13] && /*touched*/ ctx[16]);
    			add_location(span1, file$5, 42, 4, 1115);
    			attr_dev(div, "class", "form-group svelte-1y35szn");
    			add_location(div, file$5, 30, 0, 741);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, textarea);
    			append_dev(div, t0);
    			append_dev(div, span0);
    			append_dev(span0, t1);
    			append_dev(div, t2);
    			append_dev(div, span1);
    			append_dev(span1, t3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "input", /*input_handler*/ ctx[18], false, false, false),
    					listen_dev(textarea, "blur", /*blur_handler*/ ctx[21], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 1) {
    				attr_dev(textarea, "name", /*name*/ ctx[0]);
    			}

    			if (dirty & /*id*/ 8) {
    				attr_dev(textarea, "id", /*id*/ ctx[3]);
    			}

    			if (dirty & /*rows*/ 32) {
    				attr_dev(textarea, "rows", /*rows*/ ctx[5]);
    			}

    			if (dirty & /*placeholder*/ 4) {
    				attr_dev(textarea, "placeholder", /*placeholder*/ ctx[2]);
    			}

    			if (dirty & /*value*/ 64) {
    				prop_dev(textarea, "value", /*value*/ ctx[6]);
    			}

    			if (dirty & /*errorMessageDescription*/ 4096) set_data_dev(t1, /*errorMessageDescription*/ ctx[12]);

    			if (dirty & /*errorMessageDescription, requiredDescription, touched*/ 71680) {
    				toggle_class(span0, "show", /*errorMessageDescription*/ ctx[12] && !/*requiredDescription*/ ctx[11] && /*touched*/ ctx[16]);
    			}

    			if (dirty & /*errorMessageDescriptionMaxLength*/ 16384) set_data_dev(t3, /*errorMessageDescriptionMaxLength*/ ctx[14]);

    			if (dirty & /*errorMessageDescriptionMaxLength, requiredDescriptionMaxLength, touched*/ 90112) {
    				toggle_class(span1, "show", /*errorMessageDescriptionMaxLength*/ ctx[14] && !/*requiredDescriptionMaxLength*/ ctx[13] && /*touched*/ ctx[16]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(30:0) {#if inputType === \\\"textarea\\\"}",
    		ctx
    	});

    	return block;
    }

    // (50:8) {#each bgColorOptions as option}
    function create_each_block$2(ctx) {
    	let div;
    	let label;
    	let input;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			input = element("input");
    			t = space();
    			attr_dev(input, "type", "radio");
    			attr_dev(input, "name", "bg-color");
    			attr_dev(input, "class", "choose-color svelte-1y35szn");
    			input.__value = /*option*/ ctx[25].CODE;
    			input.value = input.__value;
    			set_style(input, "background-color", /*option*/ ctx[25].CODE);
    			/*$$binding_groups*/ ctx[23][0].push(input);
    			add_location(input, file$5, 52, 16, 1626);
    			attr_dev(label, "key", /*option*/ ctx[25].CODE);
    			attr_dev(label, "class", "svelte-1y35szn");
    			add_location(label, file$5, 51, 12, 1584);
    			add_location(div, file$5, 50, 8, 1566);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, input);
    			input.checked = input.__value === /*colors*/ ctx[15];
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_handler_1*/ ctx[19], false, false, false),
    					listen_dev(input, "change", /*input_change_handler*/ ctx[22])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*colors*/ 32768) {
    				input.checked = input.__value === /*colors*/ ctx[15];
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*$$binding_groups*/ ctx[23][0].splice(/*$$binding_groups*/ ctx[23][0].indexOf(input), 1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(50:8) {#each bgColorOptions as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*inputType*/ ctx[1] === "textarea") return create_if_block$3;
    		if (/*inputType*/ ctx[1] === "radio") return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TextInput', slots, []);
    	let { name } = $$props;
    	let { inputType = null } = $$props;
    	let { placeholder } = $$props;
    	let { id } = $$props;
    	let { type = null } = $$props;
    	let { rows = null } = $$props;
    	let { value = "" } = $$props;
    	let { requiredTitle = true } = $$props;
    	let { errorMessageTitle = "" } = $$props;
    	let { requiredTitleMaxLength = true } = $$props;
    	let { errorMessageTitleMaxLength = "" } = $$props;
    	let { requiredDescription = true } = $$props;
    	let { errorMessageDescription = "" } = $$props;
    	let { requiredDescriptionMaxLength = true } = $$props;
    	let { errorMessageDescriptionMaxLength = "" } = $$props;
    	let bgColorOptions = APP_CONSTANTS.FORM_INPUT_DATA.INPUT_FIELDS.ADD_NOTE.NOTE_BACKGROUND.BG_COLORS;
    	let colors = "#b8e986";
    	let touched = false;

    	$$self.$$.on_mount.push(function () {
    		if (name === undefined && !('name' in $$props || $$self.$$.bound[$$self.$$.props['name']])) {
    			console.warn("<TextInput> was created without expected prop 'name'");
    		}

    		if (placeholder === undefined && !('placeholder' in $$props || $$self.$$.bound[$$self.$$.props['placeholder']])) {
    			console.warn("<TextInput> was created without expected prop 'placeholder'");
    		}

    		if (id === undefined && !('id' in $$props || $$self.$$.bound[$$self.$$.props['id']])) {
    			console.warn("<TextInput> was created without expected prop 'id'");
    		}
    	});

    	const writable_props = [
    		'name',
    		'inputType',
    		'placeholder',
    		'id',
    		'type',
    		'rows',
    		'value',
    		'requiredTitle',
    		'errorMessageTitle',
    		'requiredTitleMaxLength',
    		'errorMessageTitleMaxLength',
    		'requiredDescription',
    		'errorMessageDescription',
    		'requiredDescriptionMaxLength',
    		'errorMessageDescriptionMaxLength'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TextInput> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler_2(event) {
    		bubble.call(this, $$self, event);
    	}

    	const blur_handler = () => $$invalidate(16, touched = true);

    	function input_change_handler() {
    		colors = this.__value;
    		$$invalidate(15, colors);
    	}

    	const blur_handler_1 = () => $$invalidate(16, touched = true);

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('inputType' in $$props) $$invalidate(1, inputType = $$props.inputType);
    		if ('placeholder' in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ('id' in $$props) $$invalidate(3, id = $$props.id);
    		if ('type' in $$props) $$invalidate(4, type = $$props.type);
    		if ('rows' in $$props) $$invalidate(5, rows = $$props.rows);
    		if ('value' in $$props) $$invalidate(6, value = $$props.value);
    		if ('requiredTitle' in $$props) $$invalidate(7, requiredTitle = $$props.requiredTitle);
    		if ('errorMessageTitle' in $$props) $$invalidate(8, errorMessageTitle = $$props.errorMessageTitle);
    		if ('requiredTitleMaxLength' in $$props) $$invalidate(9, requiredTitleMaxLength = $$props.requiredTitleMaxLength);
    		if ('errorMessageTitleMaxLength' in $$props) $$invalidate(10, errorMessageTitleMaxLength = $$props.errorMessageTitleMaxLength);
    		if ('requiredDescription' in $$props) $$invalidate(11, requiredDescription = $$props.requiredDescription);
    		if ('errorMessageDescription' in $$props) $$invalidate(12, errorMessageDescription = $$props.errorMessageDescription);
    		if ('requiredDescriptionMaxLength' in $$props) $$invalidate(13, requiredDescriptionMaxLength = $$props.requiredDescriptionMaxLength);
    		if ('errorMessageDescriptionMaxLength' in $$props) $$invalidate(14, errorMessageDescriptionMaxLength = $$props.errorMessageDescriptionMaxLength);
    	};

    	$$self.$capture_state = () => ({
    		APP_CONSTANTS,
    		name,
    		inputType,
    		placeholder,
    		id,
    		type,
    		rows,
    		value,
    		requiredTitle,
    		errorMessageTitle,
    		requiredTitleMaxLength,
    		errorMessageTitleMaxLength,
    		requiredDescription,
    		errorMessageDescription,
    		requiredDescriptionMaxLength,
    		errorMessageDescriptionMaxLength,
    		bgColorOptions,
    		colors,
    		touched
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('inputType' in $$props) $$invalidate(1, inputType = $$props.inputType);
    		if ('placeholder' in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ('id' in $$props) $$invalidate(3, id = $$props.id);
    		if ('type' in $$props) $$invalidate(4, type = $$props.type);
    		if ('rows' in $$props) $$invalidate(5, rows = $$props.rows);
    		if ('value' in $$props) $$invalidate(6, value = $$props.value);
    		if ('requiredTitle' in $$props) $$invalidate(7, requiredTitle = $$props.requiredTitle);
    		if ('errorMessageTitle' in $$props) $$invalidate(8, errorMessageTitle = $$props.errorMessageTitle);
    		if ('requiredTitleMaxLength' in $$props) $$invalidate(9, requiredTitleMaxLength = $$props.requiredTitleMaxLength);
    		if ('errorMessageTitleMaxLength' in $$props) $$invalidate(10, errorMessageTitleMaxLength = $$props.errorMessageTitleMaxLength);
    		if ('requiredDescription' in $$props) $$invalidate(11, requiredDescription = $$props.requiredDescription);
    		if ('errorMessageDescription' in $$props) $$invalidate(12, errorMessageDescription = $$props.errorMessageDescription);
    		if ('requiredDescriptionMaxLength' in $$props) $$invalidate(13, requiredDescriptionMaxLength = $$props.requiredDescriptionMaxLength);
    		if ('errorMessageDescriptionMaxLength' in $$props) $$invalidate(14, errorMessageDescriptionMaxLength = $$props.errorMessageDescriptionMaxLength);
    		if ('bgColorOptions' in $$props) $$invalidate(17, bgColorOptions = $$props.bgColorOptions);
    		if ('colors' in $$props) $$invalidate(15, colors = $$props.colors);
    		if ('touched' in $$props) $$invalidate(16, touched = $$props.touched);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		name,
    		inputType,
    		placeholder,
    		id,
    		type,
    		rows,
    		value,
    		requiredTitle,
    		errorMessageTitle,
    		requiredTitleMaxLength,
    		errorMessageTitleMaxLength,
    		requiredDescription,
    		errorMessageDescription,
    		requiredDescriptionMaxLength,
    		errorMessageDescriptionMaxLength,
    		colors,
    		touched,
    		bgColorOptions,
    		input_handler,
    		input_handler_1,
    		input_handler_2,
    		blur_handler,
    		input_change_handler,
    		$$binding_groups,
    		blur_handler_1
    	];
    }

    class TextInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			name: 0,
    			inputType: 1,
    			placeholder: 2,
    			id: 3,
    			type: 4,
    			rows: 5,
    			value: 6,
    			requiredTitle: 7,
    			errorMessageTitle: 8,
    			requiredTitleMaxLength: 9,
    			errorMessageTitleMaxLength: 10,
    			requiredDescription: 11,
    			errorMessageDescription: 12,
    			requiredDescriptionMaxLength: 13,
    			errorMessageDescriptionMaxLength: 14
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextInput",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get name() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputType() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputType(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rows() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rows(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get requiredTitle() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set requiredTitle(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get errorMessageTitle() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errorMessageTitle(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get requiredTitleMaxLength() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set requiredTitleMaxLength(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get errorMessageTitleMaxLength() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errorMessageTitleMaxLength(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get requiredDescription() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set requiredDescription(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get errorMessageDescription() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errorMessageDescription(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get requiredDescriptionMaxLength() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set requiredDescriptionMaxLength(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get errorMessageDescriptionMaxLength() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errorMessageDescriptionMaxLength(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function checkEmpty(val){
        return val.trim().length === 0;
    }
    function checkLength(val , n){
            return val.trim().length >= n;
    }

    /* src/notes/NotesAdd.svelte generated by Svelte v3.55.0 */
    const file$4 = "src/notes/NotesAdd.svelte";

    // (43:0) {#if showAddNoteModal}
    function create_if_block$2(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				showAddNoteModal: /*showAddNoteModal*/ ctx[0],
    				title: APP_CONSTANTS.MODAL_DATA.ADD_NOTE.MODAL_TITLE,
    				$$slots: {
    					footer: [create_footer_slot$1],
    					default: [create_default_slot_2]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modal.$on("cancel", /*cancel_handler*/ ctx[14]);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};
    			if (dirty & /*showAddNoteModal*/ 1) modal_changes.showAddNoteModal = /*showAddNoteModal*/ ctx[0];

    			if (dirty & /*$$scope, isFormValid, selectedColor, description, descriptionRequired, descriptionMaxLengthRequired, title, titleRequired, titleMaxLengthRequired*/ 66046) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(43:0) {#if showAddNoteModal}",
    		ctx
    	});

    	return block;
    }

    // (44:0) <Modal {showAddNoteModal}  on:cancel title={APP_CONSTANTS.MODAL_DATA.ADD_NOTE.MODAL_TITLE}>
    function create_default_slot_2(ctx) {
    	let form;
    	let div0;
    	let textinput0;
    	let t0;
    	let div1;
    	let textinput1;
    	let t1;
    	let textinput2;
    	let current;
    	let mounted;
    	let dispose;

    	textinput0 = new TextInput({
    			props: {
    				type: "text",
    				name: "noteTitle",
    				id: "noteTitle",
    				placeholder: "Note Title",
    				value: /*title*/ ctx[1],
    				requiredTitle: /*titleRequired*/ ctx[2],
    				errorMessageTitle: APP_CONSTANTS.ERROR_MESSAGES.ADD_NOTE.NOTE_TITLE.TITLE_REQUIRED_ERROR,
    				requiredTitleMaxLength: /*titleMaxLengthRequired*/ ctx[3],
    				errorMessageTitleMaxLength: APP_CONSTANTS.ERROR_MESSAGES.ADD_NOTE.NOTE_TITLE.TITLE_MAX_LENGTH_ERROR
    			},
    			$$inline: true
    		});

    	textinput0.$on("input", /*input_handler*/ ctx[11]);

    	textinput1 = new TextInput({
    			props: {
    				inputType: "textarea",
    				name: "noteDescription",
    				id: "noteDescription",
    				placeholder: "Note Description",
    				value: /*description*/ ctx[4],
    				rows: 7,
    				requiredDescription: /*descriptionRequired*/ ctx[5],
    				errorMessageDescription: APP_CONSTANTS.ERROR_MESSAGES.ADD_NOTE.NOTE_DESCRIPTION.DESCRIPTION_REQUIRED_ERROR,
    				requiredDescriptionMaxLength: /*descriptionMaxLengthRequired*/ ctx[6],
    				errorMessageDescriptionMaxLength: APP_CONSTANTS.ERROR_MESSAGES.ADD_NOTE.NOTE_DESCRIPTION.DESCRIPTION_MAX_LENGTH_ERROR
    			},
    			$$inline: true
    		});

    	textinput1.$on("input", /*input_handler_1*/ ctx[12]);

    	textinput2 = new TextInput({
    			props: {
    				inputType: "radio",
    				value: /*selectedColor*/ ctx[8]
    			},
    			$$inline: true
    		});

    	textinput2.$on("input", /*input_handler_2*/ ctx[13]);

    	const block = {
    		c: function create() {
    			form = element("form");
    			div0 = element("div");
    			create_component(textinput0.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(textinput1.$$.fragment);
    			t1 = space();
    			create_component(textinput2.$$.fragment);
    			add_location(div0, file$4, 45, 7, 1512);
    			add_location(div1, file$4, 59, 6, 2045);
    			add_location(form, file$4, 44, 4, 1460);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);
    			mount_component(textinput0, div0, null);
    			append_dev(form, t0);
    			append_dev(form, div1);
    			mount_component(textinput1, div1, null);
    			append_dev(form, t1);
    			mount_component(textinput2, form, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(form, "submit", prevent_default(/*addNewNote*/ ctx[10]), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const textinput0_changes = {};
    			if (dirty & /*title*/ 2) textinput0_changes.value = /*title*/ ctx[1];
    			if (dirty & /*titleRequired*/ 4) textinput0_changes.requiredTitle = /*titleRequired*/ ctx[2];
    			if (dirty & /*titleMaxLengthRequired*/ 8) textinput0_changes.requiredTitleMaxLength = /*titleMaxLengthRequired*/ ctx[3];
    			textinput0.$set(textinput0_changes);
    			const textinput1_changes = {};
    			if (dirty & /*description*/ 16) textinput1_changes.value = /*description*/ ctx[4];
    			if (dirty & /*descriptionRequired*/ 32) textinput1_changes.requiredDescription = /*descriptionRequired*/ ctx[5];
    			if (dirty & /*descriptionMaxLengthRequired*/ 64) textinput1_changes.requiredDescriptionMaxLength = /*descriptionMaxLengthRequired*/ ctx[6];
    			textinput1.$set(textinput1_changes);
    			const textinput2_changes = {};
    			if (dirty & /*selectedColor*/ 256) textinput2_changes.value = /*selectedColor*/ ctx[8];
    			textinput2.$set(textinput2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textinput0.$$.fragment, local);
    			transition_in(textinput1.$$.fragment, local);
    			transition_in(textinput2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textinput0.$$.fragment, local);
    			transition_out(textinput1.$$.fragment, local);
    			transition_out(textinput2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			destroy_component(textinput0);
    			destroy_component(textinput1);
    			destroy_component(textinput2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(44:0) <Modal {showAddNoteModal}  on:cancel title={APP_CONSTANTS.MODAL_DATA.ADD_NOTE.MODAL_TITLE}>",
    		ctx
    	});

    	return block;
    }

    // (84:8) <Button type="button" className="btn btn-md" on:click={cancelModal}>
    function create_default_slot_1$1(ctx) {
    	let t_value = APP_CONSTANTS.MODAL_DATA.ADD_NOTE.BUTTON_LABELS.CANCEL + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(84:8) <Button type=\\\"button\\\" className=\\\"btn btn-md\\\" on:click={cancelModal}>",
    		ctx
    	});

    	return block;
    }

    // (85:8) <Button type="button"  className="btn btn-md btn-danger" on:click={addNewNote} disabled={!isFormValid}>
    function create_default_slot$1(ctx) {
    	let t_value = APP_CONSTANTS.MODAL_DATA.ADD_NOTE.BUTTON_LABELS.ADD_NOTE + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(85:8) <Button type=\\\"button\\\"  className=\\\"btn btn-md btn-danger\\\" on:click={addNewNote} disabled={!isFormValid}>",
    		ctx
    	});

    	return block;
    }

    // (83:4) 
    function create_footer_slot$1(ctx) {
    	let div;
    	let button0;
    	let t;
    	let button1;
    	let current;

    	button0 = new Button({
    			props: {
    				type: "button",
    				className: "btn btn-md",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*cancelModal*/ ctx[9]);

    	button1 = new Button({
    			props: {
    				type: "button",
    				className: "btn btn-md btn-danger",
    				disabled: !/*isFormValid*/ ctx[7],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*addNewNote*/ ctx[10]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t = space();
    			create_component(button1.$$.fragment);
    			attr_dev(div, "slot", "footer");
    			add_location(div, file$4, 82, 4, 2874);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button0, div, null);
    			append_dev(div, t);
    			mount_component(button1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 65536) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};
    			if (dirty & /*isFormValid*/ 128) button1_changes.disabled = !/*isFormValid*/ ctx[7];

    			if (dirty & /*$$scope*/ 65536) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_footer_slot$1.name,
    		type: "slot",
    		source: "(83:4) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*showAddNoteModal*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showAddNoteModal*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showAddNoteModal*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
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
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NotesAdd', slots, []);
    	let { showAddNoteModal } = $$props;
    	let isFormValid = false;
    	const dispatch = new createEventDispatcher();
    	let title = "";
    	let titleRequired = false;
    	let titleMaxLengthRequired = false;
    	let description = "";
    	let descriptionRequired = false;
    	let descriptionMaxLengthRequired = false;
    	let selectedColor = "";

    	function cancelModal() {
    		dispatch('cancel');
    	}

    	function addNewNote() {
    		dispatch('add-note', { title, description, selectedColor });
    	}

    	$$self.$$.on_mount.push(function () {
    		if (showAddNoteModal === undefined && !('showAddNoteModal' in $$props || $$self.$$.bound[$$self.$$.props['showAddNoteModal']])) {
    			console.warn("<NotesAdd> was created without expected prop 'showAddNoteModal'");
    		}
    	});

    	const writable_props = ['showAddNoteModal'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NotesAdd> was created with unknown prop '${key}'`);
    	});

    	const input_handler = event => $$invalidate(1, title = event.target.value);
    	const input_handler_1 = event => $$invalidate(4, description = event.target.value);
    	const input_handler_2 = event => $$invalidate(8, selectedColor = event.target.value);

    	function cancel_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('showAddNoteModal' in $$props) $$invalidate(0, showAddNoteModal = $$props.showAddNoteModal);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		APP_CONSTANTS,
    		Modal,
    		Button,
    		TextInput,
    		checkEmpty,
    		checkLength,
    		showAddNoteModal,
    		isFormValid,
    		dispatch,
    		title,
    		titleRequired,
    		titleMaxLengthRequired,
    		description,
    		descriptionRequired,
    		descriptionMaxLengthRequired,
    		selectedColor,
    		cancelModal,
    		addNewNote
    	});

    	$$self.$inject_state = $$props => {
    		if ('showAddNoteModal' in $$props) $$invalidate(0, showAddNoteModal = $$props.showAddNoteModal);
    		if ('isFormValid' in $$props) $$invalidate(7, isFormValid = $$props.isFormValid);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('titleRequired' in $$props) $$invalidate(2, titleRequired = $$props.titleRequired);
    		if ('titleMaxLengthRequired' in $$props) $$invalidate(3, titleMaxLengthRequired = $$props.titleMaxLengthRequired);
    		if ('description' in $$props) $$invalidate(4, description = $$props.description);
    		if ('descriptionRequired' in $$props) $$invalidate(5, descriptionRequired = $$props.descriptionRequired);
    		if ('descriptionMaxLengthRequired' in $$props) $$invalidate(6, descriptionMaxLengthRequired = $$props.descriptionMaxLengthRequired);
    		if ('selectedColor' in $$props) $$invalidate(8, selectedColor = $$props.selectedColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*title*/ 2) {
    			$$invalidate(2, titleRequired = !checkEmpty(title));
    		}

    		if ($$self.$$.dirty & /*title*/ 2) {
    			$$invalidate(3, titleMaxLengthRequired = !checkLength(title, 60));
    		}

    		if ($$self.$$.dirty & /*description*/ 16) {
    			$$invalidate(5, descriptionRequired = !checkEmpty(description));
    		}

    		if ($$self.$$.dirty & /*description*/ 16) {
    			$$invalidate(6, descriptionMaxLengthRequired = !checkLength(description, 255));
    		}

    		if ($$self.$$.dirty & /*titleRequired, titleMaxLengthRequired, descriptionRequired, descriptionMaxLengthRequired*/ 108) {
    			$$invalidate(7, isFormValid = titleRequired && titleMaxLengthRequired && descriptionRequired && descriptionMaxLengthRequired);
    		}
    	};

    	return [
    		showAddNoteModal,
    		title,
    		titleRequired,
    		titleMaxLengthRequired,
    		description,
    		descriptionRequired,
    		descriptionMaxLengthRequired,
    		isFormValid,
    		selectedColor,
    		cancelModal,
    		addNewNote,
    		input_handler,
    		input_handler_1,
    		input_handler_2,
    		cancel_handler
    	];
    }

    class NotesAdd extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { showAddNoteModal: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotesAdd",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get showAddNoteModal() {
    		throw new Error("<NotesAdd>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showAddNoteModal(value) {
    		throw new Error("<NotesAdd>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    let nanoid = (size = 21) =>
      crypto.getRandomValues(new Uint8Array(size)).reduce((id, byte) => {
        byte &= 63;
        if (byte < 36) {
          id += byte.toString(36);
        } else if (byte < 62) {
          id += (byte - 26).toString(36).toUpperCase();
        } else if (byte > 62) {
          id += '-';
        } else {
          id += '_';
        }
        return id
      }, '');

    /* src/components/Select.svelte generated by Svelte v3.55.0 */

    const file$3 = "src/components/Select.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (9:0) {#each options as option}
    function create_each_block$1(ctx) {
    	let option;
    	let t_value = /*option*/ ctx[3].LABEL + "";
    	let t;
    	let option_key_value;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			attr_dev(option, "key", option_key_value = /*option*/ ctx[3].CLASS_NAME);
    			option.__value = option_value_value = /*option*/ ctx[3].CLASS_NAME;
    			option.value = option.__value;
    			attr_dev(option, "class", "svelte-we1m2j");
    			add_location(option, file$3, 9, 0, 132);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*options*/ 2 && t_value !== (t_value = /*option*/ ctx[3].LABEL + "")) set_data_dev(t, t_value);

    			if (dirty & /*options*/ 2 && option_key_value !== (option_key_value = /*option*/ ctx[3].CLASS_NAME)) {
    				attr_dev(option, "key", option_key_value);
    			}

    			if (dirty & /*options*/ 2 && option_value_value !== (option_value_value = /*option*/ ctx[3].CLASS_NAME)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(9:0) {#each options as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = /*options*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select, "class", "svelte-we1m2j");
    			if (/*selectedLayout*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$3, 7, 0, 69);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selectedLayout*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*options*/ 2) {
    				each_value = /*options*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selectedLayout, options*/ 3) {
    				select_option(select, /*selectedLayout*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Select', slots, []);
    	let { options } = $$props;
    	let { selectedLayout } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (options === undefined && !('options' in $$props || $$self.$$.bound[$$self.$$.props['options']])) {
    			console.warn("<Select> was created without expected prop 'options'");
    		}

    		if (selectedLayout === undefined && !('selectedLayout' in $$props || $$self.$$.bound[$$self.$$.props['selectedLayout']])) {
    			console.warn("<Select> was created without expected prop 'selectedLayout'");
    		}
    	});

    	const writable_props = ['options', 'selectedLayout'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Select> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		selectedLayout = select_value(this);
    		$$invalidate(0, selectedLayout);
    		$$invalidate(1, options);
    	}

    	$$self.$$set = $$props => {
    		if ('options' in $$props) $$invalidate(1, options = $$props.options);
    		if ('selectedLayout' in $$props) $$invalidate(0, selectedLayout = $$props.selectedLayout);
    	};

    	$$self.$capture_state = () => ({ options, selectedLayout });

    	$$self.$inject_state = $$props => {
    		if ('options' in $$props) $$invalidate(1, options = $$props.options);
    		if ('selectedLayout' in $$props) $$invalidate(0, selectedLayout = $$props.selectedLayout);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selectedLayout, options, select_change_handler];
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { options: 1, selectedLayout: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Select",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get options() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedLayout() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedLayout(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Header.svelte generated by Svelte v3.55.0 */
    const file$2 = "src/components/Header.svelte";

    function create_fragment$2(ctx) {
    	let header;
    	let div1;
    	let h3;
    	let t1;
    	let div0;
    	let p;
    	let t3;
    	let select;
    	let updating_selectedLayout;
    	let current;

    	function select_selectedLayout_binding(value) {
    		/*select_selectedLayout_binding*/ ctx[1](value);
    	}

    	let select_props = { options: APP_CONSTANTS.LAYOUT_OPTIONS };

    	if (/*selectedLayout*/ ctx[0] !== void 0) {
    		select_props.selectedLayout = /*selectedLayout*/ ctx[0];
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, 'selectedLayout', select_selectedLayout_binding, /*selectedLayout*/ ctx[0]));

    	const block = {
    		c: function create() {
    			header = element("header");
    			div1 = element("div");
    			h3 = element("h3");
    			h3.textContent = "POCKET NOTES";
    			t1 = space();
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "Default View";
    			t3 = space();
    			create_component(select.$$.fragment);
    			attr_dev(h3, "class", "svelte-v2z85d");
    			add_location(h3, file$2, 10, 6, 263);
    			attr_dev(p, "class", "svelte-v2z85d");
    			add_location(p, file$2, 13, 8, 366);
    			attr_dev(div0, "class", "view-selection svelte-v2z85d");
    			add_location(div0, file$2, 12, 6, 329);
    			attr_dev(div1, "class", "container svelte-v2z85d");
    			add_location(div1, file$2, 9, 4, 233);
    			attr_dev(header, "class", "header svelte-v2z85d");
    			add_location(header, file$2, 7, 2, 175);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div1);
    			append_dev(div1, h3);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(div0, t3);
    			mount_component(select, div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const select_changes = {};

    			if (!updating_selectedLayout && dirty & /*selectedLayout*/ 1) {
    				updating_selectedLayout = true;
    				select_changes.selectedLayout = /*selectedLayout*/ ctx[0];
    				add_flush_callback(() => updating_selectedLayout = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(select);
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

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let { selectedLayout } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (selectedLayout === undefined && !('selectedLayout' in $$props || $$self.$$.bound[$$self.$$.props['selectedLayout']])) {
    			console.warn("<Header> was created without expected prop 'selectedLayout'");
    		}
    	});

    	const writable_props = ['selectedLayout'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	function select_selectedLayout_binding(value) {
    		selectedLayout = value;
    		$$invalidate(0, selectedLayout);
    	}

    	$$self.$$set = $$props => {
    		if ('selectedLayout' in $$props) $$invalidate(0, selectedLayout = $$props.selectedLayout);
    	};

    	$$self.$capture_state = () => ({ Select, APP_CONSTANTS, selectedLayout });

    	$$self.$inject_state = $$props => {
    		if ('selectedLayout' in $$props) $$invalidate(0, selectedLayout = $$props.selectedLayout);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selectedLayout, select_selectedLayout_binding];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { selectedLayout: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get selectedLayout() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedLayout(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/notes/NotesItem.svelte generated by Svelte v3.55.0 */
    const file$1 = "src/notes/NotesItem.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (24:0) {#each notes as note}
    function create_each_block(ctx) {
    	let div3;
    	let div0;
    	let h2;
    	let t0_value = /*note*/ ctx[7].title + "";
    	let t0;
    	let t1;
    	let div1;
    	let p0;
    	let t2_value = /*note*/ ctx[7].description + "";
    	let t2;
    	let t3;
    	let div2;
    	let p1;
    	let t4_value = /*note*/ ctx[7].dateCreated + "";
    	let t4;
    	let t5;
    	let button;
    	let i;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[5](/*note*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			p0 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			p1 = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			button = element("button");
    			i = element("i");
    			attr_dev(h2, "class", "svelte-bal1ok");
    			add_location(h2, file$1, 26, 6, 1057);
    			attr_dev(div0, "class", "note-header darken-background svelte-bal1ok");

    			set_style(div0, "background-color", /*note*/ ctx[7].selectedColor
    			? /*note*/ ctx[7].selectedColor
    			: APP_CONSTANTS.FORM_INPUT_DATA.INPUT_FIELDS.ADD_NOTE.NOTE_BACKGROUND.DEFAULT_BG);

    			add_location(div0, file$1, 25, 3, 856);
    			attr_dev(p0, "class", "description svelte-bal1ok");
    			add_location(p0, file$1, 29, 6, 1122);
    			attr_dev(div1, "class", "note-body svelte-bal1ok");
    			add_location(div1, file$1, 28, 3, 1092);
    			attr_dev(p1, "class", "svelte-bal1ok");
    			add_location(p1, file$1, 32, 6, 1226);
    			attr_dev(i, "class", "fa fa-trash-alt svelte-bal1ok");
    			add_location(i, file$1, 38, 33, 1398);
    			attr_dev(button, "class", "delete-note-btn svelte-bal1ok");
    			add_location(button, file$1, 35, 6, 1275);
    			attr_dev(div2, "class", "note-footer flex-between svelte-bal1ok");
    			add_location(div2, file$1, 31, 3, 1181);
    			attr_dev(div3, "class", "note svelte-bal1ok");

    			set_style(div3, "background-color", /*note*/ ctx[7].selectedColor
    			? /*note*/ ctx[7].selectedColor
    			: APP_CONSTANTS.FORM_INPUT_DATA.INPUT_FIELDS.ADD_NOTE.NOTE_BACKGROUND.DEFAULT_BG);

    			add_location(div3, file$1, 24, 0, 683);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, p0);
    			append_dev(p0, t2);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, p1);
    			append_dev(p1, t4);
    			append_dev(div2, t5);
    			append_dev(div2, button);
    			append_dev(button, i);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*notes*/ 1 && t0_value !== (t0_value = /*note*/ ctx[7].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*notes*/ 1) {
    				set_style(div0, "background-color", /*note*/ ctx[7].selectedColor
    				? /*note*/ ctx[7].selectedColor
    				: APP_CONSTANTS.FORM_INPUT_DATA.INPUT_FIELDS.ADD_NOTE.NOTE_BACKGROUND.DEFAULT_BG);
    			}

    			if (dirty & /*notes*/ 1 && t2_value !== (t2_value = /*note*/ ctx[7].description + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*notes*/ 1 && t4_value !== (t4_value = /*note*/ ctx[7].dateCreated + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*notes*/ 1) {
    				set_style(div3, "background-color", /*note*/ ctx[7].selectedColor
    				? /*note*/ ctx[7].selectedColor
    				: APP_CONSTANTS.FORM_INPUT_DATA.INPUT_FIELDS.ADD_NOTE.NOTE_BACKGROUND.DEFAULT_BG);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(24:0) {#each notes as note}",
    		ctx
    	});

    	return block;
    }

    // (44:0) {#if showDeleteNoteModal}
    function create_if_block$1(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				showDeleteNoteModal: /*showDeleteNoteModal*/ ctx[1],
    				title: APP_CONSTANTS.MODAL_DATA.DELETE_NOTE.MODAL_TITLE,
    				$$slots: { footer: [create_footer_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};
    			if (dirty & /*showDeleteNoteModal*/ 2) modal_changes.showDeleteNoteModal = /*showDeleteNoteModal*/ ctx[1];

    			if (dirty & /*$$scope, deletedId*/ 1028) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(44:0) {#if showDeleteNoteModal}",
    		ctx
    	});

    	return block;
    }

    // (47:6) <Button type="button" className="btn btn-md" on:click={cancelModal}>
    function create_default_slot_1(ctx) {
    	let t_value = APP_CONSTANTS.MODAL_DATA.DELETE_NOTE.BUTTON_LABELS.NO + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(47:6) <Button type=\\\"button\\\" className=\\\"btn btn-md\\\" on:click={cancelModal}>",
    		ctx
    	});

    	return block;
    }

    // (48:6) <Button type="button"  className="btn btn-md btn-danger" on:click = {deleteNote(deletedId)}>
    function create_default_slot(ctx) {
    	let t_value = APP_CONSTANTS.MODAL_DATA.DELETE_NOTE.BUTTON_LABELS.YES + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(48:6) <Button type=\\\"button\\\"  className=\\\"btn btn-md btn-danger\\\" on:click = {deleteNote(deletedId)}>",
    		ctx
    	});

    	return block;
    }

    // (46:3) 
    function create_footer_slot(ctx) {
    	let div;
    	let button0;
    	let t;
    	let button1;
    	let current;

    	button0 = new Button({
    			props: {
    				type: "button",
    				className: "btn btn-md",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*cancelModal*/ ctx[3]);

    	button1 = new Button({
    			props: {
    				type: "button",
    				className: "btn btn-md btn-danger",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", function () {
    		if (is_function(/*deleteNote*/ ctx[4](/*deletedId*/ ctx[2]))) /*deleteNote*/ ctx[4](/*deletedId*/ ctx[2]).apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t = space();
    			create_component(button1.$$.fragment);
    			attr_dev(div, "slot", "footer");
    			add_location(div, file$1, 45, 3, 1582);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button0, div, null);
    			append_dev(div, t);
    			mount_component(button1, div, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 1024) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_footer_slot.name,
    		type: "slot",
    		source: "(46:3) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t;
    	let if_block_anchor;
    	let current;
    	let each_value = /*notes*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let if_block = /*showDeleteNoteModal*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*notes, APP_CONSTANTS, showDeleteNoteModal, deletedId*/ 7) {
    				each_value = /*notes*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t.parentNode, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (/*showDeleteNoteModal*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showDeleteNoteModal*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
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
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NotesItem', slots, []);
    	let { notes = [] } = $$props;
    	let { showDeleteNoteModal } = $$props;
    	let deletedId = null;
    	const dispatch = new createEventDispatcher();

    	function cancelModal() {
    		$$invalidate(1, showDeleteNoteModal = false);
    	}

    	function deleteNote(id) {
    		let newNotes = notes.filter(n => n.id !== id);
    		$$invalidate(0, notes = newNotes);
    		$$invalidate(1, showDeleteNoteModal = false);
    		localStorage.setItem("notes", JSON.stringify(notes));
    	}

    	$$self.$$.on_mount.push(function () {
    		if (showDeleteNoteModal === undefined && !('showDeleteNoteModal' in $$props || $$self.$$.bound[$$self.$$.props['showDeleteNoteModal']])) {
    			console.warn("<NotesItem> was created without expected prop 'showDeleteNoteModal'");
    		}
    	});

    	const writable_props = ['notes', 'showDeleteNoteModal'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NotesItem> was created with unknown prop '${key}'`);
    	});

    	const click_handler = note => {
    		$$invalidate(1, showDeleteNoteModal = true);
    		$$invalidate(2, deletedId = note.id);
    	};

    	$$self.$$set = $$props => {
    		if ('notes' in $$props) $$invalidate(0, notes = $$props.notes);
    		if ('showDeleteNoteModal' in $$props) $$invalidate(1, showDeleteNoteModal = $$props.showDeleteNoteModal);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		APP_CONSTANTS,
    		Modal,
    		Button,
    		notes,
    		showDeleteNoteModal,
    		deletedId,
    		dispatch,
    		cancelModal,
    		deleteNote
    	});

    	$$self.$inject_state = $$props => {
    		if ('notes' in $$props) $$invalidate(0, notes = $$props.notes);
    		if ('showDeleteNoteModal' in $$props) $$invalidate(1, showDeleteNoteModal = $$props.showDeleteNoteModal);
    		if ('deletedId' in $$props) $$invalidate(2, deletedId = $$props.deletedId);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [notes, showDeleteNoteModal, deletedId, cancelModal, deleteNote, click_handler];
    }

    class NotesItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { notes: 0, showDeleteNoteModal: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotesItem",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get notes() {
    		throw new Error("<NotesItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set notes(value) {
    		throw new Error("<NotesItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showDeleteNoteModal() {
    		throw new Error("<NotesItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showDeleteNoteModal(value) {
    		throw new Error("<NotesItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.55.0 */
    const file = "src/App.svelte";

    // (67:2) {#if showAddNoteModal}
    function create_if_block(ctx) {
    	let notesadd;
    	let current;

    	notesadd = new NotesAdd({
    			props: {
    				showAddNoteModal: /*showAddNoteModal*/ ctx[0]
    			},
    			$$inline: true
    		});

    	notesadd.$on("cancel", /*cancelModal*/ ctx[5]);
    	notesadd.$on("add-note", /*addNewNote*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(notesadd.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(notesadd, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const notesadd_changes = {};
    			if (dirty & /*showAddNoteModal*/ 1) notesadd_changes.showAddNoteModal = /*showAddNoteModal*/ ctx[0];
    			notesadd.$set(notesadd_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notesadd.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notesadd.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(notesadd, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(67:2) {#if showAddNoteModal}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let header;
    	let updating_selectedLayout;
    	let t0;
    	let div1;
    	let div0;
    	let button;
    	let i;
    	let t1;
    	let notesitem;
    	let div1_class_value;
    	let t2;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	function header_selectedLayout_binding(value) {
    		/*header_selectedLayout_binding*/ ctx[6](value);
    	}

    	let header_props = {};

    	if (/*selectedLayout*/ ctx[3] !== void 0) {
    		header_props.selectedLayout = /*selectedLayout*/ ctx[3];
    	}

    	header = new Header({ props: header_props, $$inline: true });
    	binding_callbacks.push(() => bind(header, 'selectedLayout', header_selectedLayout_binding, /*selectedLayout*/ ctx[3]));

    	notesitem = new NotesItem({
    			props: {
    				notes: /*notes*/ ctx[2],
    				showDeleteNoteModal: /*showDeleteNoteModal*/ ctx[1]
    			},
    			$$inline: true
    		});

    	notesitem.$on("cancels", /*cancelModal*/ ctx[5]);
    	let if_block = /*showAddNoteModal*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			button = element("button");
    			i = element("i");
    			t1 = space();
    			create_component(notesitem.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(i, "class", "fa fa-solid fa-plus svelte-10mndv0");
    			add_location(i, file, 61, 8, 1705);
    			attr_dev(button, "class", "add-note-btn svelte-10mndv0");
    			attr_dev(button, "id", "add-note-btn");
    			add_location(button, file, 58, 8, 1588);
    			attr_dev(div0, "class", "add-note svelte-10mndv0");
    			add_location(div0, file, 57, 5, 1557);
    			attr_dev(div1, "class", div1_class_value = "notes-wrapper container " + /*selectedLayout*/ ctx[3] + " svelte-10mndv0");
    			add_location(div1, file, 56, 2, 1496);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			append_dev(button, i);
    			append_dev(div1, t1);
    			mount_component(notesitem, div1, null);
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const header_changes = {};

    			if (!updating_selectedLayout && dirty & /*selectedLayout*/ 8) {
    				updating_selectedLayout = true;
    				header_changes.selectedLayout = /*selectedLayout*/ ctx[3];
    				add_flush_callback(() => updating_selectedLayout = false);
    			}

    			header.$set(header_changes);
    			const notesitem_changes = {};
    			if (dirty & /*notes*/ 4) notesitem_changes.notes = /*notes*/ ctx[2];
    			if (dirty & /*showDeleteNoteModal*/ 2) notesitem_changes.showDeleteNoteModal = /*showDeleteNoteModal*/ ctx[1];
    			notesitem.$set(notesitem_changes);

    			if (!current || dirty & /*selectedLayout*/ 8 && div1_class_value !== (div1_class_value = "notes-wrapper container " + /*selectedLayout*/ ctx[3] + " svelte-10mndv0")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (/*showAddNoteModal*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showAddNoteModal*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(notesitem.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(notesitem.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			destroy_component(notesitem);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { showAddNoteModal = false } = $$props;
    	let { showDeleteNoteModal = false } = $$props;

    	// Get Todays Date //
    	const TODAYS_DATE = new Date();

    	// Get date value //
    	const DATE_VAL = String(TODAYS_DATE.getDate());

    	// Get month value //
    	const MONTH_VAL = TODAYS_DATE.toLocaleString('en-us', { month: 'short' });

    	let notes = JSON.parse(localStorage.getItem("notes") || "[]");
    	let selectedLayout;

    	// if(selectedLayout !== undefined){
    	//  localStorage.setItem("layout" , selectedLayout)
    	//   }
    	// $:{
    	//   if(selectedLayout !== undefined){
    	//     selectedLayout = localStorage.getItem("layout" , selectedLayout)
    	//   }
    	// }
    	function addNewNote(event) {
    		let newNote = {
    			id: nanoid(),
    			title: event.detail.title,
    			description: event.detail.description,
    			dateCreated: DATE_VAL + " " + MONTH_VAL,
    			selectedColor: event.detail.selectedColor
    		};

    		$$invalidate(2, notes = [newNote, ...notes]);
    		localStorage.setItem("notes", JSON.stringify(notes));
    		$$invalidate(0, showAddNoteModal = false);
    	}

    	function cancelModal() {
    		$$invalidate(0, showAddNoteModal = false);
    	}

    	const writable_props = ['showAddNoteModal', 'showDeleteNoteModal'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function header_selectedLayout_binding(value) {
    		selectedLayout = value;
    		$$invalidate(3, selectedLayout);
    	}

    	const click_handler = () => {
    		$$invalidate(0, showAddNoteModal = true);
    	};

    	$$self.$$set = $$props => {
    		if ('showAddNoteModal' in $$props) $$invalidate(0, showAddNoteModal = $$props.showAddNoteModal);
    		if ('showDeleteNoteModal' in $$props) $$invalidate(1, showDeleteNoteModal = $$props.showDeleteNoteModal);
    	};

    	$$self.$capture_state = () => ({
    		NotesAdd,
    		nanoid,
    		Header,
    		NotesItem,
    		Button,
    		showAddNoteModal,
    		showDeleteNoteModal,
    		TODAYS_DATE,
    		DATE_VAL,
    		MONTH_VAL,
    		notes,
    		selectedLayout,
    		addNewNote,
    		cancelModal
    	});

    	$$self.$inject_state = $$props => {
    		if ('showAddNoteModal' in $$props) $$invalidate(0, showAddNoteModal = $$props.showAddNoteModal);
    		if ('showDeleteNoteModal' in $$props) $$invalidate(1, showDeleteNoteModal = $$props.showDeleteNoteModal);
    		if ('notes' in $$props) $$invalidate(2, notes = $$props.notes);
    		if ('selectedLayout' in $$props) $$invalidate(3, selectedLayout = $$props.selectedLayout);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		showAddNoteModal,
    		showDeleteNoteModal,
    		notes,
    		selectedLayout,
    		addNewNote,
    		cancelModal,
    		header_selectedLayout_binding,
    		click_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			showAddNoteModal: 0,
    			showDeleteNoteModal: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get showAddNoteModal() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showAddNoteModal(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showDeleteNoteModal() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showDeleteNoteModal(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
