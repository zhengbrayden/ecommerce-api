<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<h3 align="center">E-commerce api</h3>

  <p align="center">
    Power Your E-commerce Backend
    <br />
    <br />
    <a href="https://github.com/zhengbrayden/ecommerce-api/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/zhengbrayden/ecommerce-api/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>


<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://snails-app-0462ed495077.herokuapp.com/)
* *Click image for live project.
* This project is a RESTful API meant to serve as the backend component of an E-commerce application. Through this API, users are able to register accounts, browse items in the store, edit their carts, and checkout and pay via a Stripe hosted checkout page. After a payment is confirmed, an order record is created which is viewable in a user's transaction history.
* On the administrative end of the application, admin authenticated users can edit the inventory of the store, process asynchronous payments, and track the status of orders.

![Stripe Screen Shot][stripe-screenshot]
<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![Express][Express.js]][Express-url]
* [![MongoDB][MongoDB]][Mongo-url]
* [![Stripe][Stripe]][Stripe-url]
* [![Node][Node]][Node-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>


## Challenges
The biggest challenge in creating this project was integrating with the Stripe API to collect user payment. Challenges I faced include:

- Integrating with Stripe webhooks to receive events from Stripe when a checkout session was completed. Due to the nature of the internet, multiple webhooks could be sent for the same event, so I had to make sure my checkout fulfillment was idempotent. 
- Due to the transient and unreliable nature of webhooks/the internet, creating a manual resolution option via pinging the Stripe API to ensure that checkouts would not be stuck in a permanent unresolved state. 
- Tracking stripe checkout sessions using database records; Maintaining a good internal state of the app with respect to the state of Stripe; For example, making sure a user did not have access to payment before cancelling their checkout in internal state. Otherwise, the store owner would have to issue refunds and pay transaction costs out of pocket.
<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Notable features

- Ability to cancel checkouts on the Stripe checkout page.
- Ability to pay using asynchronous payments (payments that take days to complete) by tentatively placing orders.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Learning
The primary aim of building this project was to learn as much as possible about backend web development from the ground up. My learning includes:
- How to design a concurrent application (web application). How database transactions work and their importance for ACID principles.
- Dealing with edge cases arising from the non-deterministic nature of the internet
- Organizing an Express project
- At a higher level, designing a web-app using the abstractions of a frontend and backend
<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

- Refund feature
- Frontend
- Display order information on payment success

See the [open issues](https://github.com/zhengbrayden/ecommerce-api/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Brayden Zheng - zhengbrayden@gmail.com

Project Link: [https://github.com/zhengbrayden/ecommerce-api](https://github.com/zhengbrayden/ecommerce-api)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* https://roadmap.sh/projects/ecommerce-api

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/zhengbrayden/ecommerce-api.svg?style=for-the-badge
[contributors-url]: https://github.com/zhengbrayden/ecommerce-api/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/zhengbrayden/ecommerce-api.svg?style=for-the-badge
[forks-url]: https://github.com/zhengbrayden/ecommerce-api/network/members
[stars-shield]: https://img.shields.io/github/stars/zhengbrayden/ecommerce-api.svg?style=for-the-badge
[stars-url]: https://github.com/zhengbrayden/ecommerce-api/stargazers
[issues-shield]: https://img.shields.io/github/issues/zhengbrayden/ecommerce-api.svg?style=for-the-badge
[issues-url]: https://github.com/zhengbrayden/ecommerce-api/issues
[license-shield]: https://img.shields.io/github/license/zhengbrayden/ecommerce-api.svg?style=for-the-badge
[license-url]: https://github.com/zhengbrayden/ecommerce-api/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/brayden-zheng
[product-screenshot]: images/screenshot.png
[stripe-screenshot]: images/stripe.png
[Express.js]: https://img.shields.io/badge/Express-222222?style=for-the-badge&logo=express&logoColor=white
[Express-url]: https://expressjs.com/
[MongoDB]: https://img.shields.io/badge/MongoDB-03AC0E?style=for-the-badge&logo=mongodb&logoColor=white
[Mongo-url]: https://www.mongodb.com/
[Stripe]: https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white
[Stripe-url]: https://stripe.com/en-ca
[Node]: https://img.shields.io/badge/Node-72A854?style=for-the-badge&logo=nodedotjs&logoColor=white
[Node-url]: https://nodejs.org/en
