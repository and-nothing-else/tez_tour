import $ from 'jquery'


class App {
    constructor() {
        this._initMainMenu();
    }

    _initMainMenu() {
        const $mainMenu = $(".main_menu"),
            $mainMenuTrigger = $mainMenu.find(".trigger");
        $mainMenuTrigger.on("click", () => $mainMenu.toggleClass("open"));
    }
}


$(function(){
    new App();
});
