(function () {
    let player = null;

    function main() {
        player = new Player('.player', 'sample');

        console.log('player', player);
    }

    // waits  for the DOM to be ready
    document.addEventListener('DOMContentLoaded', main);
})();
