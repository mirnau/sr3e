<a id="{{ include.id }}"></a>

<div class="req-card" role="region" aria-labelledby="{{ include.id }}-title"
     data-repo="{{ include.repo | default: site.github.repository_nwo | default: 'mirnau/sr3e' }}"
     data-reqid="{{ include.id }}"
     data-title="{{ include.title }}"
     data-specurl="{{ site.url }}{{ site.baseurl }}{{ page.url }}#{{ include.id }}">
  <div class="req-card__header">
    <span class="req-card__badge">{{ include.id }}</span>
    {% if include.level %}
      {% assign lslug = include.level | downcase | replace: ' ', '-' %}
      <span class="req-card__level level-{{ lslug }}">{{ include.level }}</span>
    {% endif %}
    <h3 id="{{ include.id }}-title" class="req-card__title">{{ include.title }}</h3>
  </div>

  <div class="req-card__meta">
    <span><strong>Component:</strong> {{ include.component }}</span>
  </div>

  <div class="req-card__body">
    <div class="req-card__section req-card__section--desc">
      <details open>
        <summary><strong>Description</strong></summary>
        <pre class="req-card__pre">{{ include.description | default: include.notes | default: "" }}</pre>
      </details>
    </div>

    <div class="req-card__section req-card__section--ac">
      <details open>
        <summary><strong>Acceptance Criteria (local)</strong></summary>
        <pre class="req-card__pre">{{ include.ac | default: "" }}</pre>
      </details>
    </div>

    <div class="req-card__section req-card__section--non-goals">
      <details>
        <summary><strong>Out of scope / Non-goals</strong></summary>
        <pre class="req-card__pre">{{ include.non_goals | default: "" }}</pre>
      </details>
    </div>
  </div>

  <div class="req-card__actions">
    <a class="req-card__btn js-req-issue-btn"
       data-new-url="https://github.com/{{ include.repo | default: site.github.repository_nwo | default: 'mirnau/sr3e' }}/issues/new?template={{ include.template | default: 'feature.yml' | uri_escape }}&title={{ include.id | uri_escape }}%3A%20{{ include.title | uri_escape }}&body={{-
         'Implements: ' | append: include.id | append: '%0A' |
         'Spec anchor: ' | append: page.url | append: '#' | append: include.id | uri_escape -}}"
       href="#">
      Create issue
    </a>

    <button class="req-card__btn js-req-reopen-btn" style="display:none" type="button">Reopen issue</button>

    <button class="req-card__btn" type="button" onclick="navigator.clipboard.writeText('{{ site.url }}{{ site.baseurl }}{{ page.url }}#{{ include.id }}')">
      Copy link
    </button>
  </div>
</div>

