import { Stringify, Parse, FormatsExport } from './qs';

type qs = {
  stringify: Stringify,
  parse: Parse,
  formats: FormatsExport,
};

export = qs;
