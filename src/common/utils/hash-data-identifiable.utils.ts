import { createHash } from 'crypto';

export const hash = (string, typeHash = 'sha256') => {
  return createHash(typeHash).update(string).digest('hex');
};

export const hashEmailUseWhere = (secretKeyEmail, attribute = 'email') => {
  return `encode(sha256(concat('${secretKeyEmail}',LOWER(${attribute}))::bytea), 'hex') = :${attribute}`;
};

export const encodeEmail = (secretKeyEmail, email) => {
  return createHash('sha256')
    .update(secretKeyEmail + email?.toLowerCase())
    .digest('hex');
};

export const hashEmail = (string) => {
  let email = string || null;
  if (email?.indexOf('@scg.com') === 0) {
    const arrText = email?.split('@');
    const setCharAt = (str, index, chr) => {
      if (index > str.length - 1) return str;
      return str.substring(0, index) + chr + str.substring(index + 1);
    };

    if (arrText.length > 1) {
      const nameText = arrText?.[0];
      const mailText = arrText?.[1];
      email =
        setCharAt(
          setCharAt(
            setCharAt(nameText, nameText.length - 3, '*'),
            nameText.length - 2,
            '*',
          ),
          nameText.length - 1,
          '*',
        ) +
        '@' +
        mailText;
    }
  }

  return email;
};

export const checkHashEmailAndPhone = (string, forceHashAll = false) => {
  let text = string || null;
  if (
    typeof text === 'string' &&
    text?.[0] === '0' &&
    text?.length >= 4 &&
    text
  ) {
    text = hash(text);
  } else if (typeof text === 'string' && text?.indexOf('@') > -1 && text) {
    text = hashEmail(text);
  } else if (forceHashAll) {
    text = hash(text);
  }

  return text;
};

/**
 *
 * @param obj value
 * @param type 'object' | 'textNoNObj' | 'array' | 'string'
 * @returns
 */
export const transformerValueGetLog = (obj, type = 'object') => {
  try {
    if (type === 'textNoNObj') {
      return checkHashEmailAndPhone(obj);
    }

    const newObj = type === 'array' ? [] : {};
    Object.entries(obj || {})?.forEach(([key, value]) => {
      if (
        typeof value === 'string' &&
        (value.indexOf('[{') > -1 || value.indexOf('[]') > -1)
      ) {
        value = JSON.parse(value);
      }

      if (Array.isArray(value)) {
        newObj[key] = transformerValueGetLog(value, 'array');
      } else if (typeof value === 'object') {
        newObj[key] = transformerValueGetLog(value, 'object');
      } else {
        const identifiable = [
          'telephone',
          'first-name',
          'firstname',
          'surname',
          'lastname',
          'mobile-number',
          'phone',
          'name',
          'mobile',
          'username',
          'password',
          'email',
          'address',
          'building',
          'floor',
          'social',
          'facebook',
          'line',
          'instagram',
          'ig',
          'fb',
          'room',
          'house',
        ];

        const identifiableTextArray = ['phones'];

        identifiable?.forEach((keyv) => {
          if (
            key?.toLocaleLowerCase()?.indexOf(keyv) > -1 &&
            !identifiableTextArray.includes(key)
          ) {
            value = checkHashEmailAndPhone(value, true);
          }
        });

        if (identifiableTextArray.includes(key)) {
          const strValue = value;
          if (typeof strValue === 'string') {
            let strValueArr = strValue?.split(',');
            strValueArr = strValueArr?.map((v) => {
              return hash(v);
            });
            value = strValueArr?.join(', ');
          }
        }

        value = checkHashEmailAndPhone(value);

        newObj[key] = value;
      }
    });

    return newObj;
  } catch (error) {
    return obj;
  }
};
