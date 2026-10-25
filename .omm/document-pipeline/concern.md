A process restart cannot resume transient uploads. Startup marks processing rows failed and asks for re-upload. Parser crashes/timeouts become failed records instead of taking down the API.
