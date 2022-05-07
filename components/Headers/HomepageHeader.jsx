import setRichtTextToReactComponents from '../../lib/helpers/setRichTextToReactComponents';
import Button from '../Button';
import createSlug from '../../lib/helpers/createSlug';

const HomepageHeader = ({ title, info, buttonCollection }) => {
  return (
    <div className="relative pt-16 pb-32 flex content-center items-center justify-center h-screen">
      <div className="bg-landing-background bg-cover bg-center absolute top-0 w-full h-full" />
      <div className="container max-w-8xl relative mx-auto">
        <div className="items-center flex flex-wrap">
          <div className="bg-gray opacity-90 rounded p-10 w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
            <div className="sm:text-center lg:text-left">
              {title?.json ? (
                <h1 className="text-4xl tracking-tight font-manrope font-extrabold text-white sm:text-5xl md:text-6xl">
                  {setRichtTextToReactComponents(title.json)}
                </h1>
              ) : null}

              {info?.json ? (
                <div className="mt-3 text-base text-white sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  {setRichtTextToReactComponents(info.json)}
                </div>
              ) : null}
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-3">
                {buttonCollection.items.map((btn, i) => (
                  <Button
                    key={i}
                    title={btn.title}
                    type={btn.type}
                    internal_link={
                      btn.internalLink &&
                      createSlug(btn.internalLink.slug, btn.internalLink.__typename)
                    }
                    external_link={btn.externalLink}
                    extra_classes="sm:w-auto"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomepageHeader;
