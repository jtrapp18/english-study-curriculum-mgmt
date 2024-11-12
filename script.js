
// function changeActiveTab() {
//     const tabs = document.querySelectorAll('.tab-names h2');

//     // Loop through each <h2> element and attach an event listener
//     tabs.forEach(tab => {
//         tab.addEventListener("click", function() {

//             tabs.forEach(t => {
//                 // select content based on ID that matches tab name
//                 const tabName = t.textContent;
//                 const tabContent = document.querySelector(`#${tabName.toLowerCase()}`);

//                 if (t===tab) {
//                     // add active-tab class to selected tab name and content
//                     t.classList.add('active-tab');
//                     tabContent.classList.add('active-tab');
//                 }
//                 else {
//                     // remove active-tab class to all other tab names and contents
//                     t.classList.remove('active-tab');
//                     tabContent.classList.remove('active-tab');
//                 }})
//         });
//     });
// }

function createTabMenuListener(){
    const tabMenu = document.querySelector('.tab-names');
    tabMenu.addEventListener("click", handleTabSelectionEvent)
}

function handleTabSelectionEvent(e){
    switchToTab(e.target.innerText)
}

function switchToTab(tabName){
    const activeTabName = document.querySelector('.tab-names h2.active-tab');
    activeTabName.classList.remove('active-tab')
    
    const activeTabContent = document.querySelector(`#${activeTabName.innerText.toLowerCase()}`);
    activeTabContent.classList.remove('active-tab')

    const selectedTabName = document.querySelector(`.tab-names h2[data-name="${tabName.toLowerCase()}"]`);
    selectedTabName.classList.add('active-tab');
    
    const selectedTabContent = document.querySelector(`#${tabName.toLowerCase()}`);
    selectedTabContent.classList.add('active-tab')    
}

function logoZoom() {
    const logos = document.querySelectorAll('footer img');

    // Loop through each <h2> element and attach an event listener
    logos.forEach(logo => {
        
        logo.addEventListener("mouseover", function() {
            logo.style.width = "40px";
        });

        logo.addEventListener("mouseout", function() {
            logo.style.width = "30px";
        });
    });
}

// window.onload = function () {
//     let images = ['cats_under_table', 'cats_on_porch', 'cats_on_couch'];
//     let index = 0;
    
//     function change() {
//         const imgElement = document.querySelector('#cats');
//         imgElement.src = `./img/home/${images[index]}.jpg`;
//         index > 1 ? index = 0 : index++;
//     }

//     setInterval(change, 5000);
// };

function addScrollEvents() {
    document.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        const scrollPosition = window.scrollY;
    
        if (scrollPosition > 100) { // Adjust the threshold as needed
        header.classList.add('minimized');
        } else {
        header.classList.remove('minimized');
        }
    })
}

//changeActiveTab();
createTabMenuListener()
addScrollEvents();
logoZoom();