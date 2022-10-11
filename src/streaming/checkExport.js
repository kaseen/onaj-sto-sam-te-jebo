const {trackListMAIN} = require('../../storage/listTrack');

function regex(niska){
    //niska koja ulazi na parsiranje
	var ulaz = niska;
	var fix = ulaz.replace(/([,.-]*['"]*[\[\](){}]*[?=]*)*/g, '');
	return fix;
}

function provera(_textTweet){
    //_textTweet je tekst tvita koji dolazi u program
	var ret = false;
	// lista je niz Niski
	var lista = trackListMAIN;
	var textTweet = _textTweet.split(" ");
	var keywords = [];

	for(p=0;p<lista.length;p++){
		// svaku Nisku iz trackListMAIN razdvoj na niz reci
		// keywords = trackListMAIN[i]
		keywords = lista[p].split(" ");
		// textTweet je input
		if(proveri(textTweet, keywords) === true){
			ret = true;
			break;
		}
	}
	return ret;
}

function proveri(textTweet, keywords){
    //textTweet je text tvita isecen sa flexom 
    //keywords je iz listaPretrage lista reci
	var bool;
	for(i=0; i<keywords.length; i++){
		bool = false;
		for(j=0; j<textTweet.length; j++){
			if(textTweet[j] == keywords[i]){
				bool = true;
				break;
			}
		}
		if(bool === false)
			break;
	}

return bool;
}

module.exports = {
    regex,
    provera
}