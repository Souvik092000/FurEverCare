$(document).ready(function() {
    $("form").validate({
      rules: {
        username: "required",
        password: "required",
        confirmPassword: {
          equalTo: "#password"
        }
      },
      messages: {
        username: "Please enter your username",
        password: "Please provide a password",
        confirmPassword: "Passwords do not match"
      }
    });
  });
  