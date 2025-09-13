$(document).ready(function () {
  // On nationality change → fetch states
  $("#nationality").on("change", function () {
    const countryCode = $(this).val();

    if (!countryCode) return;

    $.getJSON(`/api/states/${countryCode}`, function (states) {
      const stateSelect = $("#state");
      stateSelect.empty().append('<option value="" hidden>Select State</option>');
      states.forEach((s) => stateSelect.append(`<option value="${s}">${s}</option>`));
      stateSelect.prop("disabled", states.length === 0);

      $("#city").empty().append('<option value="" hidden>Select City</option>').prop("disabled", true);
    });
  });

  // On state change → fetch cities
  $("#state").on("change", function () {
    const countryCode = $("#nationality").val();
    const state = $(this).val();

    if (!countryCode || !state) return;

    $.getJSON(`/api/cities/${countryCode}/${state}`, function (cities) {
      const citySelect = $("#city");
      citySelect.empty().append('<option value="" hidden>Select City</option>');
      cities.forEach((c) => citySelect.append(`<option value="${c}">${c}</option>`));
      citySelect.prop("disabled", cities.length === 0);
    });
  });
});
