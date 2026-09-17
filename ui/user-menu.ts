import m, { ClosureComponent, Component } from "mithril";

const component: ClosureComponent = (): Component => {
  return {
    view: () => {
      if (window.username) {
        return m(
          "div.user-menu",
          window.username,
          m(
            "button",
            {
              title: "Close GenieACS",
              onclick: () => {
                window.close();
                setTimeout(() => {
                  if (!window.closed) location.replace("about:blank");
                }, 100);
                return false;
              },
            },
            "Close",
          ),
        );
      } else {
        return m(
          "div.user-menu",
          m(
            "a",
            {
              href:
                "#!/login?" + m.buildQueryString({ continue: m.route.get() }),
            },
            "Log in",
          ),
        );
      }
    },
  };
};

export default component;
