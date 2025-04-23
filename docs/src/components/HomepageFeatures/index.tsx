import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import { JSX } from 'react';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Easy to Build',
    Svg: require('@site/static/img/Coffee-Jug-Icon.svg').default,
    description: (
      <>
        SyncSip was designed to be easy to build for anyone who is willing to buy the necessary material
      </>
    ),
  },
  {
    title: 'Level up your coffee machine',
    Svg: require('@site/static/img/Coffee-Brew-Icon.svg').default,
    description: (
      <>
        The SyncSip project equips your coffee machine with features that usually come at a high price point.
        These features enable you to make data driven espresso and join the awesome community
      </>
    ),
  },
  {
    title: 'Open Source',
    Svg: require('@site/static/img/Heart-Coffee-Icon.svg').default,
    description: (
      <>
        The Project is open source, that means it's totally free to use and if you want to contribute to the community and the project you can also do that!
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
