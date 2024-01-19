// https://flowbite.com/docs/getting-started/javascript/
initFlowbite();

var toolbarOptions = [
  ["bold", "italic", "underline", "strike"], // toggled buttons
  ["blockquote", "code-block"],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }], // superscript/subscript
  [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
  [{ direction: "rtl" }], // text direction

  [{ size: ["small", false, "large", "huge"] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ["link", "image", "video", "formula"], // add's image support
  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ["clean"], // remove formatting button
];

var quill = undefined;

if (document.querySelector("#editor")) {
  quill = new Quill("#editor", {
    modules: {
      toolbar: toolbarOptions,
    },
    theme: "snow",
  });
}

document.querySelectorAll("form.default-form").forEach(function (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const { redirectTo, method } = e.target.dataset;

    const formData = new FormData(e.target);
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    let body = undefined;

    if (["POST", "PUT"].includes(method.toUpperCase())) {
      body = JSON.stringify(data);
    }

    const params = new URLSearchParams(data).toString();

    window
      .fetch(`${e.target.action}?${params}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body,
      })
      .then(function (response) {
        // TODO: show success message
        response.json().then(function (data) {
          if (data.error) {
            // TODO: show error message from response

            Toastify({
              text: data.error,
              duration: 5000,
              style: {
                background: "linear-gradient(to right, #b00000, #f00)",
              },
            }).showToast();
            return;
          }

          form.reset();

          if (redirectTo) {
            window.location.href = redirectTo;
          }

          Toastify({
            text: data.result,
            duration: 5000,
            style: {
              background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
          }).showToast();
        });
      })
      .catch(function (data) {
        console.log(data);
        // TODO: show default error message
        Toastify({
          text: "Щось пішло не так",
          duration: 5000,
          style: {
            background: "linear-gradient(to right, #b00000, #f00)",
          },
        }).showToast();
      });
  });
});
