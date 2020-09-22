import { mount } from 'enzyme';
import React from 'react';
import { ISubstance } from '../../model/substance';
import { IProduct } from '../../model/product';
import DrugIndex, { IndexType } from './index';

describe(DrugIndex, () => {
  it('should render horizontal items', () => {
    const component = mount(
      <DrugIndex
        title={'Coffee'}
        indexType={IndexType.Horizontal}
        items={[
          { name: 'A' },
          { name: 'B' },
          { name: 'C' },
          { name: 'D' },
          { name: 'E' },
          { name: 'F' },
          { name: 'G' },
          { name: 'H' },
          { name: 'I' },
          { name: 'J' },
          { name: 'K' },
          { name: 'L' },
          { name: 'M' },
          { name: 'N' },
          { name: 'O' },
          { name: 'P' },
          { name: 'Q' },
          { name: 'R' },
          { name: 'S' },
          { name: 'T' },
          { name: 'U' },
          { name: 'V' },
          { name: 'W' },
          { name: 'X' },
          { name: 'Y' },
          { name: 'Z' },
          { name: '0' },
          { name: '1' },
          { name: '2' },
          { name: '3' },
          { name: '4' },
          { name: '5' },
          { name: '6' },
          { name: '7' },
          { name: '8' },
          { name: '9' },
        ]}
      />,
    );
    expect(component).toMatchSnapshot();
  });
  it('should render substances', () => {
    const product: IProduct = { name: 'Ibuprofen gel', count: 1 };
    const substance: ISubstance = {
      name: 'Ibuprofen',
      products: [product],
      count: 1,
    };
    const substances = [substance];
    const component = mount(
      <DrugIndex
        title={'Coffee'}
        items={substances}
        indexType={IndexType.SubstancesIndex}
      />,
    );
    expect(component).toMatchSnapshot();
  });
});
