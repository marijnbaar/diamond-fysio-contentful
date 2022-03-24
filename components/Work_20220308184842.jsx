export default function Testimonial() {
  return (
    <section className="pb-20 bg-gray-100 -mt-32">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap relative z-50">
          <div color="red" icon="stars" title="Awarded Agency">
            Divide details about your product or agency work into parts. A
            paragraph describing a feature will be enough.
          </div>
          <div color="lightBlue" icon="autorenew" title="Free Revisions">
            Keep you user engaged by providing meaningful information. Remember
            that by this time, the user is curious.
          </div>
          <div color="teal" icon="fingerprint" title="Verified Company">
            Write a few lines about each one. A paragraph describing a feature
            will be enough. Keep you user engaged!
          </div>
        </div>

        {/* <div className="flex flex-wrap items-center mt-32">
                <div className="w-full md:w-5/12 px-4 mx-auto">
                    <div className="text-blue-gray-800 p-3 text-center inline-flex items-center justify-center w-16 h-16 mb-6 shadow-lg rounded-full bg-white">
                        <Icon name="people" size="3xl" />
                    </div>
                    <H4 color="gray">Working with us is a pleasure</H4>
                    <LeadText color="blueGray">
                        Don't let your uses guess by attaching tooltips and
                        popoves to any element. Just make sure you enable
                        them first via JavaScript.
                    </LeadText>
                    <LeadText color="blueGray">
                        The kit comes with three pre-built pages to help you
                        get started faster. You can change the text and
                        images and you're good to go. Just make sure you
                        enable them first via JavaScript.
                    </LeadText>
                    <a
                        href="#pablo"
                        className="font-medium text-light-blue-500 mt-2 inline-block"
                    >
                        Read More
                    </a>
                </div>

                <div className="w-full md:w-4/12 px-4 mx-auto flex justify-center mt-24 lg:mt-0">
                    <Card>
                        <CardImage alt="Card Image" src={Teamwork} />
                        <CardBody>
                            <H6 color="gray">Top Notch Services</H6>
                            <Paragraph color="blueGray">
                                The Arctic Ocean freezes every winter and
                                much of the sea-ice then thaws every summer,
                                and that process will continue whatever
                                happens.
                            </Paragraph>
                        </CardBody>
                    </Card>
                </div>
            </div> */}
      </div>
    </section>
  );
}
