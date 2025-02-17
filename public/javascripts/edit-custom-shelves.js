window.addEventListener("DOMContentLoaded", (e) => {
  const userId = parseInt(document.querySelector("#userId").innerText, 10);

  // ***ADDING NEW CUSTOM SHELF
  const addShelfForm = document.querySelector(".addShelfForm");
  const tbody = document.querySelector('tbody');

  addShelfForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(addShelfForm);

    const shelfName = formData.get("addShelf");

    const res = await fetch(`/users/${userId}/customShelves`, {
      method: "POST",
      body: JSON.stringify({
        name: shelfName,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    const { check } = data;

    if (check === 'success') {
      const tr = document.createElement('tr');
      tr.className = 'shelf';
      tr.innerHTML = `
      <td class="remove">
        <form class="remove-custom" action="/custom-shelves/${shelfName}/delete" method="post">
          <button type="submit" class="remove-custom-button" data-shelf-name='${shelfName}'>X</button>
        </form>
      </td>
      <td class="userShelf">
        <div class="displayShelfName">
          <a class="displayShelfNameLink" href="/my-game-guides/custom-shelves/${shelfName}">${shelfName} (0)</a>
          <a class="renameUserShelfLink" href="#"> Rename</a>
        </div>
        <div class="renameUserShelf">
          <form class="renameShelfForm" action="#" method="post">
            <input type="hidden" name="_csrf" value=csrfToken>
            <input class="renameUserShelfText" type="text" name="renameShelf" value="${shelfName}">
            <button class="renameShelfBtn" type="button">Save</button>
            <a class="cancelRenameBtn" href="#">Cancel</a>
          </form>
        </div>
      </td>
      `;

      tbody.appendChild(tr);
    } else {
      const p = document.getElementById('errorMessage');
      p.innerText = check;
    }

  });

  // Delete custom shelf
  let removeCustomBtns = document.querySelectorAll('.remove-custom-button');

  const removeShelf = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    let shelfName = e.target.dataset.shelfName;

    if (window.confirm(`Are you sure you'd like to remove ${shelfName}?`)) {
      const res = await fetch(`/custom-shelves/${shelfName}`, {
        method: "DELETE"
      });

      if (res.ok) e.path[2].remove();
    }
  };

  removeCustomBtns.forEach(button => {
    button.addEventListener('click', removeShelf);
  });

  // Display rename shelf form
  let renameUserShelfLink = document.querySelectorAll('.renameUserShelfLink');

  const displayRenameForm = (e) => {
    let shelfName = e.target.dataset.shelfName;
    let renameUserShelfSpan = document.querySelector(`.renameUserShelf.${shelfName}`);

    e.target.style.display = 'none';
    renameUserShelfSpan.style.display = 'inline';
  };

  renameUserShelfLink.forEach(link => {
    link.addEventListener('click', displayRenameForm);
  });

  // Cancel renaming shelf
  // let cancelRenameBtns = document.querySelectorAll('.cancelRenameBtn');

  // const cancelRename = (e) => {
  //   let shelfName = e.target.dataset.shelfName;
  //   let renameUserShelfSpan = document.querySelector(`.renameUserShelf.${shelfName}`);
  //   let renameLink = document.querySelector(`.renameUserShelfLink.${shelfName}`);

  //   renameUserShelfSpan.style.display = 'none';
  //   renameLink.style.display = 'inline';
  // };

  // cancelRenameBtns.forEach(button => {
  //   button.addEventListener('click', cancelRename);
  // });
});
