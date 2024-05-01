const buildUrl = (base: string, searchParams: { [x: string]: string }) => {
  const url = new URL(base);

  for(const key in searchParams) {
    url.searchParams.append(key, searchParams[key]);
  }

  url.searchParams.append("f_TPR","r86400");
  url.searchParams.append("f_JT","C");
 url.searchParams.append("sortBy","DD");

  return url;
};

export default buildUrl;
