export const URL_PARAM_SHOW_TUTORIAL = 'tutorial';


export const shouldShowTutorialAtStart = () => {
  const url = new URL(window.location.href);
  const tutorialParam = url.searchParams.get(URL_PARAM_SHOW_TUTORIAL);
  if (tutorialParam === 'true') {
    return true;
  } else if (tutorialParam === 'false') {
    return false;
  }
  // Default to showing the tutorial on desktop
  return window.innerWidth > 1024;
};
