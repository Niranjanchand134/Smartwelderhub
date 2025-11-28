import React from "react";
import Header from "./header";
import Footer from "./Footer";

const ContactUs = () => {
  return (
    <>
    <Header/>
      {/* Page Header Start */}
      <div
        className="container-fluid page-header pt-5 wow fadeIn"
        data-wow-delay="0.1s"
      >
        <div className="container text-center pt-5">
          <div className="row justify-content-center">
            <div className="col-lg-7">
              <div className="bg-white p-5">
                <h1 className="display-6 text-uppercase mb-3 animated slideInDown">
                  Contact
                </h1>
                <nav aria-label="breadcrumb" className="animated slideInDown">
                  <ol className="breadcrumb justify-content-center mb-0">
                    <li className="breadcrumb-item">
                      <a href="#">Home</a>
                    </li>
                    <li className="breadcrumb-item">
                      <a href="#">Pages</a>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Contact
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Page Header End */}

      {/* Contact Start */}
      <div className="pt-6 pb-6">
        <div
          className="container-fluid appoinment py-5 wow fadeIn"
          data-wow-delay="0.1s"
        >
          <div className="container pt-5">
            <div className="row gy-5 gx-0">
              {/* Left Section */}
              <div
                className="col-lg-6 pe-lg-5 wow fadeIn"
                data-wow-delay="0.3s"
              >
                <h1 className="display-6 text-uppercase text-white mb-4">
                  Have Any Query? Feel Free To Contact Us
                </h1>
                <p
                  className="text-white mb-5 wow fadeIn"
                  data-wow-delay="0.4s"
                >
                  The contact form is currently inactive. Get a functional and
                  working contact form with Ajax & PHP in a few minutes. Just
                  copy and paste the files, add a little code and you're done.{" "}
                  <a href="https://htmlcodex.com/contact-form">Download Now</a>.
                </p>

                <div
                  className="d-flex align-items-start wow fadeIn"
                  data-wow-delay="0.5s"
                >
                  <div className="btn-lg-square bg-white">
                    <i className="bi bi-envelope-at text-dark fs-3"></i>
                  </div>
                  <div className="ms-3">
                    <h6 className="text-white text-uppercase">Mail Us</h6>
                    <span className="text-white">info@example.com</span>
                  </div>
                </div>

                <hr className="bg-body" />

                <div
                  className="d-flex align-items-start wow fadeIn"
                  data-wow-delay="0.6s"
                >
                  <div className="btn-lg-square bg-white">
                    <i className="bi bi-telephone text-dark fs-3"></i>
                  </div>
                  <div className="ms-3">
                    <h6 className="text-white text-uppercase">Call Us</h6>
                    <span className="text-white">+012 345 67890</span>
                  </div>
                </div>
              </div>

              {/* Right Section */}
              <div
                className="col-lg-6 mb-n5 wow fadeIn"
                data-wow-delay="0.7s"
              >
                <div className="bg-white p-5">
                  <h2 className="text-uppercase mb-4">Contact Us</h2>
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control border-0 bg-light"
                          id="name"
                          placeholder="Your Name"
                        />
                        <label htmlFor="name">Your Name</label>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-floating">
                        <input
                          type="email"
                          className="form-control border-0 bg-light"
                          id="mail"
                          placeholder="Your Email"
                        />
                        <label htmlFor="mail">Your Email</label>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control border-0 bg-light"
                          id="mobile"
                          placeholder="Your Mobile"
                        />
                        <label htmlFor="mobile">Your Mobile</label>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control border-0 bg-light"
                          id="subject"
                          placeholder="Subject"
                        />
                        <label htmlFor="subject">Subject</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-floating">
                        <textarea
                          className="form-control border-0 bg-light"
                          placeholder="Leave a message here"
                          id="message"
                          style={{ height: "130px" }}
                        ></textarea>
                        <label htmlFor="message">Message</label>
                      </div>
                    </div>
                    <div className="col-12 text-center">
                      <button className="btn btn-primary w-100 py-3" type="submit">
                        Submit Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* End Right Section */}
            </div>
          </div>
        </div>

        <div
          className="container-fluid px-0 wow fadeInUp"
          data-wow-delay="0.5s"
        >
          <iframe
            className="w-100 h-100"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6933.510024725723!2d80.5387087438532!3d29.668882693795837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39a14f32feba13d1%3A0x2919e41c6cb1709f!2sGokuleshwor%20Airport%2C%20Gokuleshwor%2C%20Nepal!5e0!3m2!1sen!2sbd!4v1762174536823!5m2!1sen!2sbd"
            style={{ minHeight: "500px", border: 0 }}
            allowFullScreen
            aria-hidden="false"
            tabIndex="0"
            title="Google Map"
          ></iframe>
          </div>
      </div>
      {/* Contact End */}
    
    <Footer/>
    </>
  );
};

export default ContactUs;
