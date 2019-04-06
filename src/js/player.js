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
        timeElement = null;
        sliderElement = null;
        durationElement = null;

        // values
        _loaded = false;
        _muted = false;
        _playing = false;
        _repeat = false;
        _time = 0; // current time formated

        constructor (selector, songUrl = null) {
            this.container = document.querySelector(selector);

            // create a new audio tag
            this.audio = new Audio();

            // HTML5 audio is supported
            if(typeof this.audio.canPlayType === 'function'){
                Object.keys(FORMATS)
                    .forEach(f => {
                        let canPlay = this.audio.canPlayType(FORMATS[f]);
                        if(canPlay !== '') this.support[f] = canPlay;
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

        /**
         * getter to get the format supported for the audio
         * @returns {*}
         */
        get format () {
            let formats = Object.keys(this.support);
            let probably = formats.filter(f => this.support[f] === 'probably');
            let maybe = formats.filter(f => this.support[f] === 'maybe');

            if(probably.length) return probably[0];
            if(maybe.length) return maybe[0];
            return false;
        }

        /**
         * getter for the loaded
         * @returns {boolean}
         */
        get loaded () {
            return this._loaded;
        }

        set loaded (value) {
            this._loaded = value;

            // update the play icon
            this.playIcon.classList.toggle('active');

            this.timeElement.innerText = this.time;
            this.sliderElement.disabled = !this._loaded;
            this.durationElement.innerText = this.duration;
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

        /**
         * Format the current time in minutes:seconds
         * @returns {number}
         */
        get time () {
            return Player.FormatTime(this.audio.currentTime);
        }

        set time (value) {
            this._time = value;

            // update the slider time
            this.sliderElement.value = (this._time * 100) / this.audio.duration;

            // updated the current duration
            this.timeElement.innerText = this.time;
        }

        get duration () {
            return Player.FormatTime(this.audio.duration);
        }

        static FormatTime (time) {
            if(time === 0) return '00:00';
            let secs = Math.round(time);
            // let hours = Math.floor(secs / (60 * 60));

            let minutesDivisor = secs % (60 * 60);
            let minutes = Math.floor(minutesDivisor / 60);

            let secondsDivisor = minutesDivisor % 60;
            let seconds = Math.ceil(secondsDivisor);

            // hours = hours ? (hours < 10 ? `0${hours}` : hours) : '--';
            minutes = minutes ? (minutes < 10 ? `0${minutes}` : minutes) : '00';
            seconds = seconds < 10 ? `0${seconds}` : seconds;

            return `${minutes}:${seconds}`;
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
            let row = document.createElement('div');
            row.classList.add('row', 'timer');

            let colTime = document.createElement('div');
            colTime.classList.add('col', 's1');
            this.timeElement = document.createElement('b');
            colTime.appendChild(this.timeElement);

            let colSlider = document.createElement('div');
            colSlider.classList.add('col', 's10');
            this.sliderElement = document.createElement('input');
            this.sliderElement.type = 'range';
            this.sliderElement.disabled = true;
            this.sliderElement.min = 0;
            this.sliderElement.max = 100;
            this.sliderElement.value = 0;
            colSlider.appendChild(this.sliderElement);

            let colDuration = document.createElement('div');
            colDuration.classList.add('col', 's1');
            this.durationElement = document.createElement('b');
            colDuration.appendChild(this.durationElement);

            // events
            row.addEventListener('change', this.timechanged.bind(this));

            row.appendChild(colTime);
            row.appendChild(colSlider);
            row.appendChild(colDuration);
            return row;
        }

        /**
         * Load the song
         */
        load (songUrl = null) {
            if(!songUrl || !Object.keys(this.support).length)
                return false;

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
            this.audio.timeElement = (this.sliderElement.value / 100) * this.audio.duration;
        }

        ended () {
            if(this.repeat) this.play();
        }
    }
})();
