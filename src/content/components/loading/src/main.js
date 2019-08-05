import Vue from 'vue';
import Main from './main.vue';

const LoadingConstructor = Vue.extend(Main);

export default function Loading(options = {}) {
  if (typeof options === 'string') {
    options = { text: options };
  }
  const instance = new LoadingConstructor({ data: options });
  instance.$mount();

  if ($(options.mountPoint).length) {
    $(options.mountPoint)[0].appendChild(instance.$el);
  } else if (this && $(this.mountPoint).length) {
    $(this.mountPoint)[0].appendChild(instance.$el);
  } else {
    document.body.appendChild(instance.$el);
  }

  instance.visible = true;
  return instance;
}

Loading.install = function(Vue, { mountPoint } = {}) {
  const context = { mountPoint };
  Vue.prototype.$loading = Loading.bind(context);
};
