/* eslint-disable no-undef */
/**
 * scroll to the bottom of the chats after new message has been added to chat
 */
 function scrollToBottomOfResults() {
    const terminalResultsDiv = document.getElementById("chats");
    terminalResultsDiv.scrollTop = terminalResultsDiv.scrollHeight;
}


/**
 * Set user response on the chat screen
 * @param {String} message user message
 */
function setUserResponse(message) {
    const user_response = `<img class="userAvatar" src='/img/userAvatar.jpg'><p class="userMsg">${message} </p><div class="clearfix"></div>`;
    $(user_response).appendTo(".chats").show("slow");

    $(".usrInput").val("");
    scrollToBottomOfResults();
    showBotTyping();
    $(".suggestions").remove();
}

/**
 * renders bot response on to the chat screen
 * @param {Array} response json array containing different types of bot response
 *
 * for more info: `https://rasa.com/docs/rasa/connectors/your-own-website#request-and-response-format`
 */
function setBotResponse(response) {
    // renders bot response after 500 milliseconds
    setTimeout(() => {
        hideBotTyping();
        if (response.length < 1) {
            // if there is no response from Rasa, send  fallback message to the user
            const fallbackMsg = "I am facing some issues, please try again later!!!";
            const BotResponse = `<img class="botAvatar" src="/img/sara_avatar.png"/><p class="botMsg">${fallbackMsg}</p><div class="clearfix"></div>`;

            $(BotResponse).appendTo(".chats").hide().fadeIn(1000);
            scrollToBottomOfResults();
        } else {
            // if we get response from Rasa
            for (let i = 0; i < response.length; i += 1) {
                // check if the response contains "text"
                if (Object.hasOwnProperty.call(response[i], "text")) {
                    if (response[i].text != null) {
                        const BotResponse = `<img class="botAvatar" src="/img/sara_avatar.png"/><p class="botMsg">${response[i].text.replace(/(?:\r\n|\r|\n)/g, '<br>')}</p><div class="clearfix"></div>`;
                        $(BotResponse).appendTo(".chats").hide().fadeIn(1000);
                    }
                }
            }
            scrollToBottomOfResults();
        }
        $(".usrInput").focus();
    }, 500);

}

/**
 * sends the user message to the rasa server,
 * @param {String} message user message
 */
function send(message) {
    $.ajax({
        url: "http://localhost:5005/webhooks/rest/webhook",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({ message, sender: sender_id }),
        success(botResponse, status) {
            console.log("Response from Rasa: ", botResponse, "\nStatus: ", status);
            // if user wants to restart the chat and clear the existing chat contents
            if (message.toLowerCase() === "/restart") {
                $("#userInput").prop("disabled", false);

                // if you want the bot to start the conversation after restart
                // customActionTrigger();
        
                return;
            }
            setBotResponse(botResponse);
        },
        error(xhr, textStatus) {
            if (message.toLowerCase() === "/restart") {
                $("#userInput").prop("disabled", false);
                // if you want the bot to start the conversation after the restart action.
                //actionTrigger();
                 return;
            }

            // if there is no response from rasa server, set error bot response
            setBotResponse("");
            console.log("Error from bot end: ", textStatus);
        },
    });
}
/**
 * sends an event to the bot,
 *  so that bot can start the conversation by greeting the user
 *
 * `Note: this method will only work in Rasa 1.x`
 */
// eslint-disable-next-line no-unused-vars
function actionTrigger() {
    $.ajax({
        url: `http://192.168.1.3:5005/conversations/${sender_id}/execute`,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            name: action_name,
            policy: "MappingPolicy",
            confidence: "0.98",
        }),
        success(botResponse, status) {
            console.log("Response from Rasa action: ", botResponse, "\nStatus: ", status);

            if (Object.hasOwnProperty.call(botResponse, "messages")) {
                setBotResponse(botResponse.messages);
            }
            $("#userInput").prop("disabled", false);
        },
        error(xhr, textStatus) {
            // if there is no response from rasa server
            setBotResponse("");
            console.log("Error from bot end: ", textStatus);
            $("#userInput").prop("disabled", false);
        },
    });
}

/**
 * sends an event to the custom action server,
 *  so that bot can start the conversation by greeting the user
 *
 * Make sure you run action server using the command
 * `rasa run actions --cors "*"`
 *
 * `Note: this method will only work in Rasa 2.x`
 */
// eslint-disable-next-line no-unused-vars
function customActionTrigger() {
    $.ajax({
        url: "http://192.168.1.3:5055/webhook/",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            next_action: action_name,
            tracker: {
                sender_id,
            },
        }),
        success(botResponse, status) {
            console.log("Response from  custom Rasa: ", botResponse, "\nStatus: ", status);

            if (Object.hasOwnProperty.call(botResponse, "responses")) {
                setBotResponse(botResponse.responses);
            }
            $("#userInput").prop("disabled", false);
        },
        error(xhr, textStatus) {
            // if there is no response from rasa server
            setBotResponse("");
            console.log("Error from bot end: ", textStatus);
            $("#userInput").prop("disabled", false);
        },
    });
}



/**
 * clears the conversation from the chat screen
 * & sends the `/resart` event to the Rasa server
 */
function restartConversation() {
    $("#userInput").prop("disabled", true);
    // destroy the existing chart
    $(".collapsible").remove();

    if (typeof chatChart !== "undefined") {
        chatChart.destroy();
    }

    $(".chart-container").remove();
    if (typeof modalChart !== "undefined") {
        modalChart.destroy();
    }
    $(".chats").html("");
    $(".usrInput").val("");
    send("/restart");
}
// triggers restartConversation function.
$("#restart").click(() => {
    restartConversation();
});

/**
 * if user hits enter or send button
 * */
$(".usrInput").on("keyup keypress", (e) => {
    const keyCode = e.keyCode || e.which;

    const text = $(".usrInput").val();
    if (keyCode === 13) {
        if (text === "" || $.trim(text) === "") {
            e.preventDefault();
            return false;
        }
        $(".usrInput").blur();
        setUserResponse(text);
        send(text);
        e.preventDefault();
        return false;
    }
    return true;
});

$("#sendButton").on("click", (e) => {
    const text = $(".usrInput").val();
    if (text === "" || $.trim(text) === "") {
        e.preventDefault();
        return false;
    }
    $(".suggestions").remove();
    $("#paginated_cards").remove();
    $(".quickReplies").remove();
    $(".usrInput").blur();
    $(".dropDownMsg").remove();
    setUserResponse(text);
    send(text);
    e.preventDefault();
    return false;
});
