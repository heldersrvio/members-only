# Members Only

![Home screen](https://i.imgur.com/9tNiymC.png)

A messageboard application made with Express and Pug and centered around authorization concepts. The password library was used to authenticate users and the bcryptojs library was used to hash and compare passwords.

Any visitor can see the messages, which are ordered by the date they were posted (beginning from the most recent), on the main page. However, the names of the authors and the timestamps are only visible for members, which are users who not only have accounts on the application but have also successfully become a 'member' by submitting the correct membership password. (For those who want to test it, the password is: 'coolpasswordformembers').

You can choose to either sign up or log in by clicking on the corresponding links on the top bar. In order to sign up, you'll be asked to enter an email, your first and last names, a password and you'll also be prompted to pick one avatar among the ones available.

Upon signing up or logging in, you'll be able to create messages and you'll also be able to gain membership by clicking on 'Become a member' and entering the correct password.

Only an administrator can delete messages. The administrator role is not accessible by the UI.

[Check out the live version](https://shrouded-bayou-29547.herokuapp.com/).
