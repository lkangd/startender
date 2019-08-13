import Vue from 'vue';
import Main from './main.vue';

const isVNode = node => node !== null && typeof node === 'object' && node.hasOwnProperty('componentOptions');
const props = {
  visible: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    default: '',
  },
  confirmBtnText: {
    type: String,
    default: '确定',
  },
  cancelBtnText: {
    type: String,
    default: '',
  },
  cancalCallback: {
    type: [Function, String],
    default: '',
  },
};
const defaultData = (() => {
  const data = {};
  for (const key in props) {
    if (props.hasOwnProperty(key)) {
      const value = props[key];
      data[key] = value.default;
    }
  }
  return function() {
    return data;
  };
})();

const PopupConstructor = Vue.extend({ ...Main, data: defaultData });

export default function Popup(options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof options === 'string') {
      options = { text: options };
    }
    options.handleConfirmResolve = resolve;
    options.handleCancelReject = reject;
    options.visible = false;
    options.closed = false;

    const instance = new PopupConstructor({ data: options });
    if (isVNode(instance.text)) {
      instance.$slots.default = [instance.text];
      instance.text = null;
    } else {
      delete instance.$slots.default;
    }
    instance.$mount();

    if ($(options.mountPoint).length) {
      $(options.mountPoint)[0].appendChild(instance.$el);
    } else if (this && $(this.mountPoint).length) {
      $(this.mountPoint)[0].appendChild(instance.$el);
    } else {
      document.body.appendChild(instance.$el);
    }

    instance.visible = true;
  });
}

Popup.install = function(Vue, { mountPoint } = {}) {
  const context = { mountPoint };
  Vue.component(Main.name, { ...Main, props });
  Vue.prototype.$popup = Popup.bind(context);
};
