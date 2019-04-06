const Player = (function () {
    const FORMATS = {
        ogg: 'audio/ogg; codecs="vorbis"',
        mp3: 'audio/mp3; codecs="mp3"',
        wav: 'audio/wav;',
    };
    const SONGS_URL = 'src/audio';
    return class Player {
        support = {};
        songUrl = null;

        // elements
        mutedIcon = null;
        playIcon = null;
        repeatIcon = null;
        timer = null;


        _loaded = false;
        _muted = false;
        _playing = false;
        _repeat = false;
        _time = 0;
        
        constructor (selector, songUrl = null) {
            this.container = document.querySelector(selector);

            // create a new audio tag
            this.audio = new Audio();

            // HTML5 audio is supported
            if(typeof this.audio.canPlayType === 'function'){
                Object.keys(FORMATS)
                    .forEach(f => {
                        let canPlay = this.audio.canPlayType(FORMATS[f]);
                        if(canPlay === 'probably' || canPlay === 'maybe')
                            this.support[f] = canPlay;
                    });
            }

            if(!Object.keys(this.support).length)
                throw new Error(`Browser does not support HTML5 Audio.`);

            this.render();
            this.load(songUrl);

            // EVENTS

            // play the loaded audio until the first fram is loaded
            this.audio.addEventListener('loadeddata', () => this.loaded = true);

            this.audio.addEventListener('timeupdate', this.timeupdate.bind(this));
            // this.audio.addEventListener('ended', this.ended.bind(this));
        }

        get format () {
            let formats = Object.keys(this.support);
            let probably = formats.filter(f => this.support[f] === 'probably');
            let maybe = formats.filter(f => this.support[f] === 'maybe');

            if(maybe.length) return maybe[0];
            if(probably.length) return probably[0];
            return false;
        }

        get loaded () {
            return this._loaded;
        }

        set loaded (value) {
            this._loaded = value;

            // update the play icon
            if(this._loaded) this.playIcon.classList.add('active');
            else this.playIcon.classList.remove('active');
        }

        get muted () {
            return this.audio.muted;
        }

        set muted (value) {
            this._muted = value;
            this.audio.muted = this._muted;

            // update the muted icon
            this.mutedIcon.classList.toggle('active');
        }

        get playing () {
            return this._playing;
        }

        set playing (value) {
            this._playing = value;

            // update the icon automatically
            this.playIcon.innerText = this._playing ? 'pause_circle_outline' : 'play_circle_outline';
        }

        get repeat () {
            return this._repeat;
        }

        set repeat (value) {
            this._repeat = value;
            this.audio.loop = this._repeat;

            // update icon
            this.repeatIcon.classList.toggle('active');
        }

        get time () {
            return this.audio.currentTime;
        }

        set time (value) {
            this._time = value;

            // update the timer
            this.timer.value = (this._time * 100) / this.audio.duration;
        }

        /**
         * Render the basic custom audio controls
         */
        render () {
            let player = document.createElement('div');
            player.classList.add('col', 's12');

            player.appendChild(this._controls());
            player.appendChild(this._timer());

            this.container.appendChild(player);
        }

        _controls () {
            let controls = document.createElement('div');
            controls.classList.add('controls');

            this.mutedIcon = document.createElement('i');
            this.mutedIcon.classList.add('material-icons', 'mute');
            this.mutedIcon.innerText = 'volume_mute';

            this.playIcon = document.createElement('i');
            this.playIcon.classList.add('material-icons', 'play');
            this.playIcon.innerText = 'play_circle_outline';

            this.repeatIcon = document.createElement('i');
            this.repeatIcon.classList.add('material-icons', 'repeat');
            this.repeatIcon.innerText = 'repeat';


            // events
            this.mutedIcon.addEventListener('click', this.toggleMute.bind(this));
            this.playIcon.addEventListener('click', this.togglePlay.bind(this));
            this.repeatIcon.addEventListener('click', this.toggleRepeat.bind(this));

            controls.appendChild(this.mutedIcon);
            controls.appendChild(this.playIcon);
            controls.appendChild(this.repeatIcon);
            return controls;
        }

        _timer () {
            let timer = document.createElement('div');
            timer.classList.add('timer');

            this.timer = document.createElement('input');
            this.timer.type = 'range';
            // this.timer.disabled = true;
            this.timer.min = 0;
            this.timer.max = 100;
            this.timer.value = 0;

            // events
            timer.addEventListener('change', this.timechanged.bind(this));

            timer.appendChild(this.timer);
            return timer;
        }

        /**
         * Load the song
         */
        load (songUrl = null) {
            if(!songUrl || !Object.keys(this.support).length)
                return false;

            this.loaded = false;
            this.songUrl = `${SONGS_URL}/${songUrl}.${this.format}`;
            this.audio.src = this.songUrl;
        }

        toggleMute () {
            this.muted = !this.muted;
        }

        togglePlay () {
            if(this.playing) this.pause();
            else this.play();
        }

        toggleRepeat () {
            this.repeat = !this.repeat;
        }

        play () {
            this.audio.play();
            this.playing = true;
        }

        pause () {
            this.audio.pause();
            this.playing = false;
        }

        timeupdate () {
            this.time = this.audio.currentTime;
        }

        timechanged () {
            this.audio.currentTime = (this.timer.value / 100) * this.audio.duration;
        }

        ended () {
            if(this.repeat) this.play();
        }
    }
})();
