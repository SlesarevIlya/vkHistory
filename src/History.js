'use strict';

const VKApi = require('node-vkapi');
const VK    = new VKApi({
    app: {
        id: 123456, ///app id
        secret: 'app-secret'
    },
    auth: {
        login: 'your-login',
        pass: 'your-password'
    }
});

class History {

}
VK.auth.user({
    scope: ['audio', 'photos', 'friends', 'wall', 'offline', 'messages']
}).then(token => {
    return VK.call('friends.get', {
        fields: ['first_name', 'last_name', 'domain']
    });
}).then(friendsList => {
    let personId = 0;
    friendsList.items.forEach(person => {
        if (person.domain === 'bulgakovk') {
            personId = person.id;
        }
    });

    return personId;
}).then(personId => {
    return VK.call('messages.getHistory', {
        user_id: personId,
        rev: 1
    }).then(person => {
        let resid = person.count;
        let offset = 0;
        let listOfMessages = [];

        while (resid > 0) {
            listOfMessages.push(getBlockMessage(offset, personId));
            resid -= 200;
            offset += 200;
            if (resid > 0) {
                console.log('--processing', personId, ':', resid,
                    'of', person.count, 'messages left');
            }
        }
        console.log(listOfMessages.count);
    });


}).catch(error => {
    // catching errors
    console.log(error);
});

function getBlockMessage(offset, personId) {
    return VK.call('messages.getHistory', {
        user_id: personId,
        count: 200,
        offset: offset,
        rev: 1
    }).then(history => {

        return history.items;
    });
}