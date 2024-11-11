<template>
  <div class="container">
    <!-- image -->
    <b-img
      fluid
      center
      width="90"
      src="img/icons/manifest-icon-192.png"
    />
    <!-- about -->
    <div class="text-center mt-4">
      <h4 class="font-italic text-dark" />
      <p
        class="text-monospace text-left mt-3"
        v-translate
      >
        GNUKhata is free and open source software (FOSS) for financial
        accounting (FA) and was initiated to cater to the needs of Small and
        Medium scale (SME) entreprises, traders, startups and Non-Governmental
        Organisastions (NGO). GNUKhata was initiated in India, in 2009. Thus it
        has been enhanced to support specific compliance and return requirements
        of the GST (tax) records and returns requirements in India. GNUKhata
        features adequate inventory management support which is integral to
        financial accounting needs for many businesses.
      </p>
      <!-- links -->
      <div class="mt-4 has-text-centered">
        <a
          class="mx-1"
          href="https://gnukhata.org"
          target="_blank"
        >
          <b-button variant="dark">
            <b-icon
              class="mr-1"
              icon="globe"
            />
            <translate>Website</translate>
          </b-button>
        </a>
        <a
          href="https://gitlab.com/gnukhata"
          target="_blank"
        >
          <b-button variant="dark">
            <b-icon
              class="mr-1"
              icon="code-square"
            />
            <translate> Source Code</translate>
          </b-button>
        </a>
        <!-- credits -->
        <div class="mt-5 d-flex-row">
          <a
            href="https://www.gnu.org/licenses/agpl-3.0.html"
            target="_blank"
          >
            <img
              class="mt-3 img-fluid"
              width="100px"
              src="img/agpl3.png"
              alt="AGPLv3 License"
            >
          </a>
          <a
            href="https://accionlabs.com"
            target="_blank"
          >
            <img
              width="200px"
              class="mt-3 img-fluid"
              src="img/accionlabs.png"
              alt="accion labs logo"
            >
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
