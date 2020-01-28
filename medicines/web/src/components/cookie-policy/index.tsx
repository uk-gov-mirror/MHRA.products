import Link from 'next/link';
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { mhra, mhra10, mhraGray10 } from '../../styles/colors';
import { mobileBreakpoint } from '../../styles/dimensions';

const StyledCookieBanner = styled.aside`
  padding: 0 10px 20px;
  color: ${mhra};
  background-color: ${mhraGray10};

  div {
    margin: auto;
    max-width: 860px;
  }

  p {
    font-size: 1.1875rem;
    line-height: 28px;
  }

  button {
    appearance: none;
    background-color: ${mhra10};
    border-radius: 5px;
    border: 1px solid ${mhra};
    color: ${mhra};
    display: block;
    padding: 10px 20px;
  }

  button:hover,
  button:focus,
  button:active {
    background-color: ${mhra};
    color: ${mhra10};
  }

  @media ${mobileBreakpoint} {
    p {
      font-size: 1rem;
      line-height: 24px;
    }

    button {
      font-size: 0.75rem;
    }
  }
`;

interface ICookieBanner {
  storageAllowed: boolean;
  setStorageAllowed: any;
}

const CookieBanner: React.FC<ICookieBanner> = props => {
  const buttonOnClick = () => {
    props.setStorageAllowed(true, true);
  };
  if (!props.storageAllowed) {
    return (
      <StyledCookieBanner>
        <div>
          <p>
            MHRA uses cookies which are essential for the site to work. We do
            not collect any data that would identify you directly. We would like
            to use Google Analytics to help us improve our services. You can
            allow this by clicking <b>accept all cookies</b> or find out more
            first by visiting our&nbsp;
            <Link href="/cookies">
              <a>cookie policy page</a>
            </Link>
            .
          </p>
          <button onClick={buttonOnClick}>Accept all cookies</button>
        </div>
      </StyledCookieBanner>
    );
  } else {
    return <> </>;
  }
};

export default CookieBanner;
