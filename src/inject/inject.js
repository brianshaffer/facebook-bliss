// checks if FB was loaded from the popup though some fanciness
// this way the box only shows when the user wants to do the follow/unfollow
chrome.extension.sendMessage({message: "checkSession"}, function(response) {
	if(response.status == 'ready'){
		// reset status
		chrome.runtime.sendMessage({message: "suspendSession"}, function (response) {
			console.log('session stopped');
		});
		massfollow_status = 'ready'; // used in cahoots with massfollow_stop button
		
		// show dialog box & begin!
		// generate box
		var elem = document.createElement('div');
		elem.style.cssText = 'position:fixed;top:22px;left:42px;text-align:center;color:#000;width:350px;height:150px;z-index:9999;box-shadow: rgba(29, 29, 29, 0.8) 1px 5px 13px; background:rgba(255, 255, 255, 0.95); border-radius: 3px;';
		elem.innerHTML = '<h1 style="position: relative;background: #3578e4;border-top-left-radius: 3px;border-top-right-radius: 3px;padding: 10px 0px;margin: 0 0 10px 0;color: #FFF;">Facebook Bliss<div id="massfollow_stop" style="position: absolute; top: 10px; right: 8px; line-height: 16px; height: 16px; width: 16px; font-size: 10px; font-family: Helvetica, Arial, sans-serif; background: #f2f3f5; color: rgb(29,33,41); border: solid 1px #ccd0d5; border-radius: 50%; cursor: pointer;">X</div></h1><h4 id="waiting_for_facebook" style="margin-top: 33px;">Waiting for Facebook to finish loading...</h4><div id="massfollow_buttons" style="display: none; margin-top: 33px;"><button type="button" style="border: solid 1px #ccd0d5;padding: 8px 20px;color: #3582f9;font-weight: bold;border-radius: 3px;background: #f2f3f5;" id="unfollow_all">Unfollow All</button> &nbsp; <button type="button" style="border: solid 1px #ccd0d5;padding: 8px 20px;color: #12479c;font-weight: bold;border-radius: 3px;background: #f2f3f5;" id="refollow_all">Re-follow All</button></div><div id="massfollow_status" style="text-align: left; margin: 0 20px; height: 92px; overflow: scroll"></div><style>#massfollow_status::-webkit-scrollbar{ display: none;}</style>';   
		elem.setAttribute("id", "unfollow_popup");
		document.body.appendChild(elem);
		
		document.getElementById("unfollow_all").addEventListener("click", openUnfollowDropdown);
		document.getElementById("refollow_all").addEventListener("click", openRefollowDropdown);
		document.getElementById("massfollow_stop").addEventListener("click", massfollowStop);

		// wait for FB to finish loading before giving user option to begin
		var readyStateCheckInterval = setInterval(function() {
			if (document.readyState === "complete") {
				clearInterval(readyStateCheckInterval);

				var dropdown = document.querySelector("#pageLoginAnchor");
				if(dropdown == null){
					// can't find dropdown for first step
					document.querySelector("#waiting_for_facebook").style.display = 'none';
					document.querySelector("#massfollow_status").innerHTML = "We can't find your feed. Perhaps Facebook updated their layout and broke our plugin. If you're looking at your feed and still seeing this, please let me know so I can fix the plugin!";
				}else{
					document.querySelector("#waiting_for_facebook").style.display = 'none';
					document.querySelector("#massfollow_buttons").style.display = 'block';
				}
			}
		}, 10);



		function massfollowStop(){
			massfollow_status = 'stop';
			document.getElementById("unfollow_popup").style.display = 'none';
		}


		function waitForElementToDisplay(selector, time, callback) {
			if(document.querySelector(selector)!=null) {
					console.log("The element is displayed, you can put your code instead of this alert.");
					callback();
					return;
			}
			else {
					setTimeout(function() {
							waitForElementToDisplay(selector, time, callback);
					}, time);
			}
		}


		function openUnfollowDropdown(){
			document.querySelector("#massfollow_buttons").style.display = "none";
			console.log('clicking dropdown');
			document.querySelector("#massfollow_status").innerHTML = "Opening News Feed Preferences...";
			var dropdown = document.querySelector("#pageLoginAnchor");
			dropdown.click();

			waitForElementToDisplay("a[ajaxify='/feed_preferences/dialog/']", 100, clickNewsFeedPreferencesForUnfollow);
		}

		function openRefollowDropdown(){
			document.querySelector("#massfollow_buttons").style.display = "none";
			console.log('clicking dropdown');
			document.querySelector("#massfollow_status").innerHTML = "Opening News Feed Preferences...";
			var dropdown = document.querySelector("#pageLoginAnchor");
			dropdown.click();

			waitForElementToDisplay("a[ajaxify='/feed_preferences/dialog/']", 100, clickNewsFeedPreferencesForRefollow);
		}

		var clickNewsFeedPreferencesForUnfollow = () => {
			console.log('clicking news feed preferences');
			document.querySelector("#massfollow_status").innerHTML = "Opening News Feed Preferences...";
			var newsFeedPreferences = document.querySelector("a[ajaxify='/feed_preferences/dialog/']");
			newsFeedPreferences.click();
			waitForElementToDisplay("div[data-testid='unfollow'] div[role='button']", 100, expandUnfollowSection);
		}

		var clickNewsFeedPreferencesForRefollow = () => {
			console.log('clicking news feed preferences');
			document.querySelector("#massfollow_status").innerHTML = "Opening News Feed Preferences...";
			var newsFeedPreferences = document.querySelector("a[ajaxify='/feed_preferences/dialog/']");
			newsFeedPreferences.click();
			waitForElementToDisplay("div[data-testid='unfollow'] div[role='button']", 100, expandRefollowSection);
		}

		var expandUnfollowSection = () => {
			console.log('expanding unfollow section');
			document.querySelector("#massfollow_status").innerHTML = "Expanding unfollow section...";
			var unfollow = document.querySelector("div[data-testid='unfollow'] div[role='button']");
			unfollow.click();

			waitForElementToDisplay("div[data-testid='unfollow'] .uiScrollableArea .uiScrollableAreaWrap", 100, scrollUnfollowable);
		}

		var expandRefollowSection = () => {
			console.log('expanding refollow section');
			document.querySelector("#massfollow_status").innerHTML = "Expanding re-follow section...";
			var unfollow = document.querySelector("div[data-testid='refollow'] div[role='button']");
			unfollow.click();

			waitForElementToDisplay("div[data-testid='refollow'] .uiScrollableArea .uiScrollableAreaWrap", 100, scrollRefollowable);
		}


		var scrollUnfollowable = () => {
			console.log('scrolling through unfollow section');
			document.querySelector("#massfollow_status").innerHTML = "Loading all users you follow... <br/><br/><em>(Don't touch Facebook while this loads)</em>";

			var scrollLoop = setInterval(function(){
				var loadingElement = document.querySelector("div[data-testid='unfollow'] .uiScrollableArea .uiScrollableAreaWrap span[aria-valuetext=\"Loading...\"]");
				if(loadingElement != null){
					console.log('scrolling');
					var scroller = document.querySelector("div[data-testid='unfollow'] .uiScrollableArea .uiScrollableAreaWrap");
					scroller.scrollTop = scroller.scrollHeight;
				}else{
					console.log('scroll finished');
					clearInterval(scrollLoop);
					doUnfollow();
					return;
				}
			}, 150);
		}


		var scrollRefollowable = () => {
			console.log('scrolling through refollow section');
			document.querySelector("#massfollow_status").innerHTML = "Loading all users you've unfollowed... <br/><br/><em>(Don't touch Facebook while this loads)</em>";

			var scrollLoop = setInterval(function(){
				var loadingElement = document.querySelector("div[data-testid='refollow'] .uiScrollableArea .uiScrollableAreaWrap span[aria-valuetext=\"Loading...\"]");
				if(loadingElement != null){
					console.log('scrolling');
					var scroller = document.querySelector("div[data-testid='refollow'] .uiScrollableArea .uiScrollableAreaWrap");
					scroller.scrollTop = scroller.scrollHeight;
				}else{
					console.log('scroll finished');
					clearInterval(scrollLoop);
					doRefollow();
					return;
				}
			}, 150);
		}

		var doUnfollow = () => {
			var friends = document.querySelectorAll('[data-testid="profile_grid_block_picture"]');

			document.querySelector("#massfollow_status").innerHTML = "Unfollowing " + friends.length + " friends/pages.";

			friends.forEach((friend, i) => {
				setTimeout(() => {
					console.log(massfollow_status);
					if(massfollow_status == 'ready'){
						friend.click();
						var name = friend.parentElement.querySelector("div:nth-child(2) > div").innerText;
						document.querySelector("#massfollow_status").innerHTML += "<div id='unfollow_profile_" + i + "'>Unfollowing " + name + "</div>";
						var massfollow_status_box = document.querySelector("#massfollow_status");
						massfollow_status_box.scrollTop = massfollow_status_box.scrollHeight;
					}
				}, i * 100);
			});

			setTimeout(() => {
				// half second after all clicks triggered
				document.querySelector("#massfollow_status").innerHTML += "<h4>Finished!</h4>";
				var massfollow_status_box = document.querySelector("#massfollow_status");
				massfollow_status_box.scrollTop = massfollow_status_box.scrollHeight;

				// launch review page after 6 seconds
				document.querySelector("#massfollow_status").innerHTML += "<p style='margin-bottom: 0px;'>Say thanks with a review! It really helps 🙂</p><p style='margin-top: 0px;'><em>Launching review page in <span id='seconds_until_review'>6</span> seconds</em></p>";
				var massfollow_status_box = document.querySelector("#massfollow_status");
				massfollow_status_box.scrollTop = massfollow_status_box.scrollHeight;
				var seconds_until_review_counter = 6;
				var seconds_until_review = setInterval(function(){
					seconds_until_review_counter--;
					document.querySelector("#seconds_until_review").innerText = seconds_until_review_counter;
					
					if(parseInt(seconds_until_review_counter) < 1){
						clearInterval(seconds_until_review);
						// do popup
						if(massfollow_status == 'ready'){
							chrome.runtime.sendMessage({message: "launchReview"}, function (response) {
								console.log('launched review page');
							});
						}
					}
				}, 1000);
			}, ((friends.length * 100) + 500) );
		}


		var doRefollow = () => {
			var friends = document.querySelectorAll('[data-testid="profile_grid_block"]');

			document.querySelector("#massfollow_status").innerHTML = "Re-following " + friends.length + " friends/pages.";

			friends.forEach((friend, i) => {
				setTimeout(() => {
					console.log(massfollow_status);
					if(massfollow_status == 'ready'){
						friend.querySelector("div").click();
						var name = friend.querySelector("div:nth-child(2) > div").innerText;
						document.querySelector("#massfollow_status").innerHTML += "<div id='refollow_profile_" + i + "'>Re-following " + name + "</div>";
						var massfollow_status_box = document.querySelector("#massfollow_status");
						massfollow_status_box.scrollTop = massfollow_status_box.scrollHeight;
					}
				}, i * 100);
			});

			setTimeout(() => {
				// half second after all clicks triggered
				document.querySelector("#massfollow_status").innerHTML += "<h4>Finished!</h4>";
				var massfollow_status_box = document.querySelector("#massfollow_status");
				massfollow_status_box.scrollTop = massfollow_status_box.scrollHeight;

				// launch review page after 6 seconds
				document.querySelector("#massfollow_status").innerHTML += "<p style='margin-bottom: 0px;'>Say thanks with a review! It really helps 🙂</p><p style='margin-top: 0px;'><em>Launching review page in <span id='seconds_until_review'>6</span> seconds</em></p>";
				var massfollow_status_box = document.querySelector("#massfollow_status");
				massfollow_status_box.scrollTop = massfollow_status_box.scrollHeight;
				var seconds_until_review_counter = 6;
				var seconds_until_review = setInterval(function(){
					seconds_until_review_counter--;
					document.querySelector("#seconds_until_review").innerText = seconds_until_review_counter;
					
					if(parseInt(seconds_until_review_counter) < 1){
						clearInterval(seconds_until_review);
						// do popup
						if(massfollow_status == 'ready'){
							chrome.runtime.sendMessage({message: "launchReview"}, function (response) {
								console.log('launched review page');
							});
						}
					}
				}, 1000);
			}, ((friends.length * 100) + 500) );
		}

	}
});