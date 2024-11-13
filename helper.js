//****************************************************************************************************
// JSON-server CRUD functionality

function getJSONByKey(dbKey) {

    return fetch(`http://localhost:3000/${dbKey}`)
    .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
}

function getJSONById(dbKey, Id) {

    return fetch(`http://localhost:3000/${dbKey}/${Id}`)
    .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
}

function getJSONbySearch(dbKey, searchKey, searchValue) {
  return fetch(`http://localhost:3000/${dbKey}?${searchKey}=${searchValue}`)
  .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
  })
}

function getEmbeddedJSON(baseKey, embeddedKey) {

    return fetch(`http://localhost:3000/${baseKey}?_embed=${embeddedKey}`)
    .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
}

function getEmbeddedJSONById(baseKey, baseId, embeddedKey) {

    return fetch(`http://localhost:3000/${baseKey}/${baseId}?_embed=${embeddedKey}`)
    .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
}

function postJSONToDb(dbKey, jsonObj) {

    return fetch(`http://localhost:3000/${dbKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonObj)
        })
        .then(res => {
            if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        // .then(data => console.log("ADDED", data))
        // .catch(e => console.error(e));
}

function patchJSONToDb(dbKey, Id, jsonObj) {

    fetch(`http://localhost:3000/${dbKey}/${Id}`, {
    method: 'PATCH',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(jsonObj)
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => console.log("EDITED", data))
    .catch(e => console.error(e));
}

function deleteJSONFromDb(dbKey, Id) {

  fetch(`http://localhost:3000/${dbKey}/${Id}`, {
  method: 'DELETE',
  headers: {
      'Content-Type': 'application/json'
  }
  })
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => console.log("DELETED", data))
  .catch(e => console.error(e));
}

//****************************************************************************************************
// Re-usable element and form functionality

function enableForm(form) {

    const inputs = form.querySelectorAll('input:not([type="submit"])')
    inputs.forEach(input => input.disabled = false);
    form.querySelectorAll('textarea').disabled = false

    const submitBtn = form.querySelector('input[type="submit"]');

    submitBtn.value = "SUBMIT CHANGES"
    form.classList.add("edit-mode")
}

function disableForm(form) {

    const inputs = form.querySelectorAll('input:not([type="submit"])')
    inputs.forEach(input => input.disabled = true);
    form.querySelectorAll('textarea').disabled = true

    const submitBtn = form.querySelector('input[type="submit"]');
    submitBtn.value = "EDIT FORM"

    form.classList.remove("edit-mode")
}
