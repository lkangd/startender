import Vue from 'vue';
import Main from './main.vue';

const ToastConstructor = Vue.extend(Main);

let instance;
const instances = [];
let seed = 1;

export default function Toast(options = {}) {
  if (typeof options === 'string') {
    options = {
      text: options,
    };
  }
  const id = 'toast_' + seed++;
  options.onClose = function() {
    Toast.close(id);
  };
  instance = new ToastConstructor({
    data: options,
  });
  instance.id = id;
  instance.$mount();

  if ($(options.mountPoint).length) {
    $(options.mountPoint)[0].appendChild(instance.$el);
  } else if (this && $(this.mountPoint).length) {
    $(this.mountPoint)[0].appendChild(instance.$el);
  } else {
    document.body.appendChild(instance.$el);
  }

  let verticalOffset = options.offset || 49;
  instances.forEach(item => {
    verticalOffset += item.$el.offsetHeight + 6;
  });
  instance.verticalOffset = verticalOffset;
  instance.visible = true;
  instances.push(instance);
  return instance;
}

['success', 'warning', 'info', 'error'].forEach(type => {
  Toast[type] = options => {
    if (typeof options === 'string') {
      options = {
        text: options,
      };
    }
    options.type = type;
    return Toast(options);
  };
});

Toast.close = function(id) {
  let len = instances.length;
  let index = -1;
  for (let i = 0; i < len; i++) {
    if (id === instances[i].id) {
      index = i;
      instances.splice(i, 1);
      break;
    }
  }
  if (len <= 1 || index === -1 || index > instances.length - 1) return;
  const removedHeight = instances[index].$el.offsetHeight;
  for (let i = index; i < len - 1; i++) {
    let dom = instances[i].$el;
    dom.style['top'] = parseInt(dom.style['top'], 10) - removedHeight - 6 + 'px';
  }
};

Toast.closeAll = function() {
  for (let i = instances.length - 1; i >= 0; i--) {
    instances[i].close();
  }
};

Toast.install = function(Vue, { mountPoint } = {}) {
  const context = { mountPoint };
  Vue.prototype.$toast = Toast.bind(context);
  ['success', 'warning', 'info', 'error'].forEach(type => {
    Vue.prototype.$toast[type] = options => {
      if (typeof options === 'string') {
        options = {
          text: options,
        };
      }
      options.type = type;
      return Toast.call(context, options);
    };
  });
};
